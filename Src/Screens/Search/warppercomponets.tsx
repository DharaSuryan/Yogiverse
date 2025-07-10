
// import PerformanceStats from "react-native-performance-stats";

import React, { useEffect } from "react";
import { memo } from "react"

const WarpperComponent = (PassedComponent: any) => memo((props: any) => {
     const navigationRef: any = React.createRef();

    
    const route = navigationRef.current?.getCurrentRoute()


    // useEffect(() => {
    //     const listener = PerformanceStats.addListener((stats) => {
    //         dispatch(setSessionField("deviceMonitering", stats))
    //     });
    //     PerformanceStats.start(true);
    //     return () => listener.remove();
    // }, []);

   

    if (props.navigation) {
        useEffect(() => {
            const f = onFocus()
            const b = onBlur()
            return () => {
                f()
                b()
            }
        }, [])

        const onFocus = () => props.navigation.addListener('focus', () => {
            // do something

            console.log("Enters in", route && route.name)
        });
        const onBlur = () => props.navigation.addListener('blur', () => {
            // do something

            console.log("leaves from", route && route.name)

        });
    }
    //  console.log("session.language", session.language)

    
    const baseProps = {
        
    }
    return (
        <PassedComponent  {...props} {...baseProps} />
    )
})


export default WarpperComponent