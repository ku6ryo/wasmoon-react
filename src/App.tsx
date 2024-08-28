import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { LuaFactory } from 'wasmoon'

function App() {

  const [aStr, setAstr] = useState('1')
  const [bStr, setBstr] = useState('2')
  const [result, setResult] = useState(0)
  const [ellapsed, setElapsed] = useState<number | null>(null)

  const onAChange  = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    setAstr(e.target.value)
  }, [])

  const onBChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBstr(e.target.value)
  }, [])

  useEffect(() => {
    ;(async () => {
      const a = Number(aStr)
      const b = Number(bStr)
      const [result, time] = await calcByLua(a, b)
      setResult(result)
      setElapsed(time)
    })()
  }, [aStr, bStr])

  const calcByLua = async (a: number, b: number) => {
    // Initialize a new lua environment factory
    // You can pass the wasm location as the first argument, useful if you are using wasmoon on a web environment and want to host the file by yourself
    const factory = new LuaFactory()
    // Create a standalone lua environment from the factory
    const lua = await factory.createEngine()
    try {
      // Run a lua string
      await lua.doString(`
      function sum(x, y)
          return x + y
      end
      `)
      // Get a global lua function as a JS function
      const start = performance.now()
      const sum = lua.global.get('sum')
      const end = performance.now()
      return [sum(a, b) as number, end - start]
    } finally {
      // Close the lua environment, so it can be freed
      lua.global.close()
    }
  }

  return (
    <>
      <div>
        <div>
          <input value={aStr} onChange={onAChange} />
        </div>
        <div>
        +
        </div>
        <div>
          <input value={bStr} onChange={onBChange} />
        </div>
        <div>
          Result: <span>{result}</span>&nbsp;
          {ellapsed !== null && (
            <>
              ,&nbsp;<span>Ellaped time: </span><span>{Math.round(ellapsed * 1000)} usec</span>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
