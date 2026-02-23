"use client"

import Matter from "matter-js"
import { useEffect, useRef, useState } from "react"

const FallingText = ({
  text = "",
  trigger = "auto",
  backgroundColor = "transparent",
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = "4rem",
}) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const canvasRef = useRef(null)

  const [started, setStarted] = useState(false)

  /* Renderiza palabras */
  useEffect(() => {
    if (!textRef.current) return

    textRef.current.innerHTML = text
      .split(" ")
      .map(
        word =>
          `<span class="falling-word">${word}</span>`
      )
      .join(" ")
  }, [text])

  /* Trigger */
  useEffect(() => {
    if (trigger === "auto") setStarted(true)
  }, [trigger])

  /* Matter.js */
  useEffect(() => {
    if (!started) return
    if (!containerRef.current || !textRef.current) return

    const {
      Engine,
      Render,
      World,
      Bodies,
      Runner,
      Mouse,
      MouseConstraint,
    } = Matter

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()

    const engine = Engine.create()
    engine.world.gravity.y = gravity

    const render = Render.create({
      element: canvasRef.current,
      engine,
      options: {
        width,
        height: height * 4,
        background: backgroundColor,
        wireframes,
      },
    })

    const walls = [
      Bodies.rectangle(width / 2, height * 4 + 30, width, 60, { isStatic: true }),
      Bodies.rectangle(-30, height * 4 / 2, 60, height * 4, { isStatic: true }),
      Bodies.rectangle(width + 30, height * 4 / 2, 60, height * 4, { isStatic: true }),
      Bodies.rectangle(width / 2, -30, width, 60, { isStatic: true }),
    ]

    const spans = [...textRef.current.querySelectorAll(".falling-word")]

    const bodies = spans.map(span => {
      const r = span.getBoundingClientRect()
      const c = container.getBoundingClientRect()

      const body = Bodies.rectangle(
        r.left - c.left + r.width / 2,
        r.top - c.top + r.height / 2,
        r.width,
        r.height,
        {
          restitution: 0.4,
          frictionAir: 0.05,
          velocity: { x: (Math.random() - 0.5) * 4, y: 3 },
        }
      )

      span.style.position = "absolute"
      return { span, body }
    })

    const mouse = Mouse.create(container)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: mouseConstraintStiffness },
    })

    World.add(engine.world, [
      ...walls,
      mouseConstraint,
      ...bodies.map(b => b.body),
    ])

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    const update = () => {
      bodies.forEach(({ span, body }) => {
        span.style.left = `${body.position.x}px`
        span.style.top = `${body.position.y}px`
        span.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
      })
      requestAnimationFrame(update)
    }

    update()

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      World.clear(engine.world)
      Engine.clear(engine)
      render.canvas.remove()
    }
  }, [started])

  return (
    <div
      ref={containerRef}
      className="falling-container"
    >
      <div
        ref={textRef}
        className="falling-text"
        style={{ fontSize }}
      />
      <div ref={canvasRef} className="falling-canvas" />
    </div>
  )
}

export default FallingText
