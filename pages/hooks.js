import { useState, useEffect } from "react"

const useCounter = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setInterval(() => {
      setCount(c => c+1)
    }, 1000)
  }, [])

  return count
}

const SimpleComponent = () => {
     console.log("Calling SimpleComponent");

    return (
        <div>SimpleComponent</div>
    )
}

export default function HooksPage() {
    const count = useCounter()
    console.log("Calling Hooks Page");
    return (
        <>
        <div>Hooks Page - {count}</div>
        <SimpleComponent />
        </>
    )
}