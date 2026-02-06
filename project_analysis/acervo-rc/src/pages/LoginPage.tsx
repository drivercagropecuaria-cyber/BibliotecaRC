import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Leaf } from 'lucide-react'
import * as THREE from 'three'

export function LoginPage() {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const COLORS = {
      green: new THREE.Color('#1A5F1A'),
      gold: new THREE.Color('#D4AF37'),
      white: new THREE.Color('#F0F0F0'),
      dark: new THREE.Color('#050805'),
    }

    const CONFIG = {
      particleCount: 22000,
      particleSize: 2.5,
    }

    const vertexShader = `
      uniform float uTime;
      uniform float uMorph;
      uniform vec2 uMouse;

      attribute vec3 aRandom;
      attribute float aSize;
      attribute vec3 aColor;

      varying vec3 vColor;
      varying float vAlpha;

      float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vColor = aColor;

        vec3 pos = position;

        float timeScale = uTime * 0.3;
        float waveX = sin(pos.y * 0.5 + timeScale + aRandom.x * 6.0) * 0.5;
        float waveY = cos(pos.x * 0.5 + timeScale + aRandom.y * 6.0) * 0.5;
        float waveZ = sin(pos.z * 0.5 + timeScale + aRandom.z * 6.0) * 0.5;

        pos.x += waveX;
        pos.y += waveY;
        pos.z += waveZ;

        float dist = distance(pos.xy, uMouse * 20.0);
        float influence = smoothstep(8.0, 0.0, dist);
        vec3 dir = normalize(pos - vec3(uMouse * 20.0, 0.0));
        pos += dir * influence * 2.0;

        pos *= 1.0 + (sin(uTime * 0.5) * 0.02);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        gl_PointSize = (aSize * CONFIG_SIZE * (30.0 / -mvPosition.z));

        float depth = smoothstep(50.0, 0.0, -mvPosition.z);
        vAlpha = depth * 0.8;
      }
    `.replace('CONFIG_SIZE', CONFIG.particleSize.toFixed(1))

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.05, dist);

        if (alpha < 0.01) discard;

        vec3 finalColor = vColor + (0.2 * alpha);
        gl_FragColor = vec4(finalColor, vAlpha * alpha);
      }
    `

    let scene: THREE.Scene | null = new THREE.Scene()
    scene.background = COLORS.dark
    scene.fog = new THREE.FogExp2(COLORS.dark, 0.03)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 20

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.position = 'fixed'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.zIndex = '0'
    renderer.domElement.style.pointerEvents = 'none'

    canvasRef.current.appendChild(renderer.domElement)

    let geometry: THREE.BufferGeometry | null = new THREE.BufferGeometry()
    const positions: number[] = []
    const randoms: number[] = []
    const colors: number[] = []
    const sizes: number[] = []

    for (let i = 0; i < CONFIG.particleCount; i += 1) {
      const angle = Math.random() * Math.PI * 2
      const radius = 5 + Math.random() * 15
      const height = (Math.random() - 0.5) * 6

      const x = Math.cos(angle) * radius
      const y = height + (Math.sin(angle * 3.0) * 2.0)
      const z = Math.sin(angle) * radius

      positions.push(x, y, z)
      randoms.push(Math.random(), Math.random(), Math.random())
      sizes.push(0.5 + Math.random() * 1.5)

      const rnd = Math.random()
      if (rnd > 0.9) {
        colors.push(COLORS.gold.r, COLORS.gold.g, COLORS.gold.b)
      } else if (rnd > 0.7) {
        colors.push(COLORS.white.r, COLORS.white.g, COLORS.white.b)
      } else {
        colors.push(COLORS.green.r, COLORS.green.g + (Math.random() * 0.1), COLORS.green.b)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 3))
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMorph: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const clock = new THREE.Clock()
    const mouse = new THREE.Vector2(9999, 9999)
    let animationId = 0

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const time = clock.getElapsedTime()
      material.uniforms.uTime.value = time

      const targetX = (mouse.x / window.innerWidth) * 2 - 1
      const targetY = -(mouse.y / window.innerHeight) * 2 + 1
      material.uniforms.uMouse.value.x += (targetX - material.uniforms.uMouse.value.x) * 0.05
      material.uniforms.uMouse.value.y += (targetY - material.uniforms.uMouse.value.y) * 0.05

      particles.rotation.y = time * 0.05
      particles.rotation.z = time * 0.01

      renderer.render(scene, camera)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationId)
      particles.removeFromParent()
      material.dispose()
      geometry?.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
      scene = null
      geometry = null
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (userId) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', userId)
          .single()
        const target = profileData?.role === 'viewer' ? '/acervo' : '/'
        navigate(target)
      } else {
        navigate('/acervo')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-rc-bg overflow-hidden">
      <div ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rc-gold rounded-2xl shadow-rc-card mb-4">
              <Leaf className="w-8 h-8 text-rc-black" />
            </div>
            <h1 className="text-2xl font-bold text-rc-text">RC Acervo Sistema de Marketing</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-rc-gold mt-2">Memoria e Futuro</p>
          </div>

          <div className="glass-card p-8">
            <div className="mb-6">
              <div className="w-full py-3 rounded-rc-pill font-semibold transition-all flex items-center justify-center gap-2 bg-rc-black text-rc-text border border-rc-border">
                <LogIn className="w-4 h-4" />
                Entrar
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                Cadastro de usuarios somente por administrador.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="rc-input w-full pl-12 pr-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="rc-input w-full pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rc-button w-full disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
