import {useState, useEffect} from "react"

export default function useNotification(){
    const [notification, setNotification] = useState({message: "", type: "success"})

    useEffect(() => {
        if (notification.message){
            const timer = setTimeout(() => {
                setNotification({message: "", type: "success"})
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [notification.message])

    const showNotification = (message, type="success") => {
        setNotification({message, type})
    }
    return {notification, showNotification}
}