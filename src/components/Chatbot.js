import React, { useEffect } from 'react';

const Chatbot = () => {
    useEffect(() => {
        // Chatbase Script
        (function () {
            if (!window.chatbase || window.chatbase("getState") !== "initialized") {
                window.chatbase = (...args) => {
                    if (!window.chatbase.q) {
                        window.chatbase.q = []
                    }
                    window.chatbase.q.push(args)
                };
                window.chatbase = new Proxy(window.chatbase, {
                    get(target, prop) {
                        if (prop === "q") {
                            return target.q
                        }
                        return (...args) => target(prop, ...args)
                    }
                })
            }

            const onLoad = function () {
                const script = document.createElement("script");
                script.src = "https://www.chatbase.co/embed.min.js";
                script.id = "icfg_Cv2zFA2M2G9PyGtl3jP5JP56";
                script.domain = "www.chatbase.co";
                document.body.appendChild(script)
            };

            if (document.readyState === "complete") {
                onLoad()
            } else {
                window.addEventListener("load", onLoad)
            }
        })();
    }, []);

    return null; // Bu bileşen görsel bir şey render etmez, sadece scripti yükler
};

export default Chatbot;
