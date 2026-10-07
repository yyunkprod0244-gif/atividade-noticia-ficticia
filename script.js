document.addEventListener("DOMContentLoaded", () => {

    /* =================================
       CANVAS DE PARTÍCULAS
    ================================= */

    const canvas = document.getElementById("spaceCanvas");
    const ctx = canvas.getContext("2d");

    let canvasWidth;
    let canvasHeight;

    let mouseX = 0;
    let mouseY = 0;

    const particles = [];
    const particleCount = 110;

    function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;

        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = canvasWidth * pixelRatio;
        canvas.height = canvasHeight * pixelRatio;

        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;

        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;

            this.size = Math.random() * 2 + 0.4;

            this.speedX =
                (Math.random() - 0.5) * 0.35;

            this.speedY =
                (Math.random() - 0.5) * 0.35;

            this.alpha =
                Math.random() * 0.65 + 0.2;

            this.color =
                Math.random() > 0.5
                    ? "#00e5ff"
                    : "#8a5cff";
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0) {
                this.x = canvasWidth;
            }

            if (this.x > canvasWidth) {
                this.x = 0;
            }

            if (this.y < 0) {
                this.y = canvasHeight;
            }

            if (this.y > canvasHeight) {
                this.y = 0;
            }
        }

        draw() {
            ctx.beginPath();

            ctx.arc(
                this.x,
                this.y,
                this.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;

            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;

            ctx.fill();

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }

    function createParticles() {
        particles.length = 0;

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const particleA = particles[i];
                const particleB = particles[j];

                const distanceX =
                    particleA.x - particleB.x;

                const distanceY =
                    particleA.y - particleB.y;

                const distance = Math.sqrt(
                    distanceX * distanceX +
                    distanceY * distanceY
                );

                if (distance < 125) {
                    const opacity =
                        0.18 - distance / 900;

                    ctx.beginPath();

                    ctx.moveTo(
                        particleA.x,
                        particleA.y
                    );

                    ctx.lineTo(
                        particleB.x,
                        particleB.y
                    );

                    ctx.strokeStyle =
                        `rgba(0, 229, 255, ${opacity})`;

                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function drawMouseGlow() {
        const gradient =
            ctx.createRadialGradient(
                mouseX,
                mouseY,
                0,
                mouseX,
                mouseY,
                240
            );

        gradient.addColorStop(
            0,
            "rgba(0, 229, 255, 0.13)"
        );

        gradient.addColorStop(
            0.5,
            "rgba(138, 92, 255, 0.05)"
        );

        gradient.addColorStop(
            1,
            "rgba(0, 0, 0, 0)"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );
    }

    function animateParticles() {
        ctx.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );

        drawMouseGlow();

        particles.forEach((particle) => {
            particle.update();
            particle.draw();
        });

        connectParticles();

        requestAnimationFrame(animateParticles);
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        createParticles();
    });

    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    resizeCanvas();

    mouseX = canvasWidth / 2;
    mouseY = canvasHeight / 2;

    createParticles();
    animateParticles();


    /* =================================
       MODELO 3D DA MESA
    ================================= */

    const viewer =
        document.getElementById("viewer3D");

    const desk =
        document.getElementById("desk3D");

    const heightControl =
        document.getElementById("heightControl");

    const resetButton =
        document.getElementById("reset3D");

    const rotateLeftButton =
        document.getElementById("rotateLeft");

    const rotateRightButton =
        document.getElementById("rotateRight");

    let rotateX = -18;
    let rotateY = -25;

    let isDragging = false;

    let startX = 0;
    let startY = 0;

    function updateDeskRotation() {
        desk.style.setProperty(
            "--rotate-x",
            `${rotateX}deg`
        );

        desk.style.setProperty(
            "--rotate-y",
            `${rotateY}deg`
        );
    }

    /* Controle de altura */

    heightControl.addEventListener("input", () => {
        const height =
            Number(heightControl.value);

        desk.style.setProperty(
            "--desk-height",
            `${height - 35}px`
        );
    });

    /* Girar para esquerda */

    rotateLeftButton.addEventListener("click", () => {
        rotateY -= 15;

        updateDeskRotation();
    });

    /* Girar para direita */

    rotateRightButton.addEventListener("click", () => {
        rotateY += 15;

        updateDeskRotation();
    });

    /* Resetar mesa */

    resetButton.addEventListener("click", () => {
        rotateX = -18;
        rotateY = -25;

        heightControl.value = 35;

        desk.style.setProperty(
            "--desk-height",
            "0px"
        );

        updateDeskRotation();
    });

    /* Arrastar com o mouse */

    viewer.addEventListener("mousedown", (event) => {
        isDragging = true;

        startX = event.clientX;
        startY = event.clientY;

        viewer.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (event) => {
        if (!isDragging) {
            return;
        }

        const movementX =
            event.clientX - startX;

        const movementY =
            event.clientY - startY;

        rotateY += movementX * 0.5;
        rotateX -= movementY * 0.35;

        rotateX = Math.max(
            -55,
            Math.min(30, rotateX)
        );

        startX = event.clientX;
        startY = event.clientY;

        updateDeskRotation();
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;

        viewer.style.cursor = "grab";
    });

    /* Arrastar no celular */

    viewer.addEventListener(
        "touchstart",
        (event) => {
            isDragging = true;

            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;
        },
        {
            passive: true
        }
    );

    viewer.addEventListener(
        "touchmove",
        (event) => {
            if (!isDragging) {
                return;
            }

            const movementX =
                event.touches[0].clientX - startX;

            const movementY =
                event.touches[0].clientY - startY;

            rotateY += movementX * 0.5;
            rotateX -= movementY * 0.35;

            rotateX = Math.max(
                -55,
                Math.min(30, rotateX)
            );

            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;

            updateDeskRotation();
        },
        {
            passive: true
        }
    );

    viewer.addEventListener("touchend", () => {
        isDragging = false;
    });

    updateDeskRotation();


    /* =================================
       CONTROLE DE LED RGB
    ================================= */

    const ledColor =
        document.getElementById("ledColor");

    const ledPresets =
        document.querySelectorAll(".led-preset");

    const rainbowMode =
        document.getElementById("rainbowMode");

    function hexToRgba(hex, opacity) {
        const cleanHex =
            hex.replace("#", "");

        const red =
            parseInt(cleanHex.substring(0, 2), 16);

        const green =
            parseInt(cleanHex.substring(2, 4), 16);

        const blue =
            parseInt(cleanHex.substring(4, 6), 16);

        return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    }

    function changeLedColor(color) {
        desk.style.setProperty(
            "--led-color",
            color
        );

        desk.style.setProperty(
            "--led-glow",
            hexToRgba(color, 0.8)
        );

        desk.classList.remove("rainbow");

        rainbowMode.classList.remove("active");

        rainbowMode.textContent =
            "🌈 Arco-íris";

        ledColor.value = color;

        ledPresets.forEach((button) => {
            button.classList.remove("active");

            if (
                button.dataset.color.toLowerCase() ===
                color.toLowerCase()
            ) {
                button.classList.add("active");
            }
        });
    }

    /* Escolher qualquer cor */

    ledColor.addEventListener("input", () => {
        changeLedColor(
            ledColor.value
        );
    });

    /* Cores pré-configuradas */

    ledPresets.forEach((button) => {
        button.addEventListener("click", () => {
            const color =
                button.dataset.color;

            changeLedColor(color);
        });
    });

    /* Modo arco-íris */

    rainbowMode.addEventListener("click", () => {
        const rainbowActive =
            desk.classList.toggle("rainbow");

        rainbowMode.classList.toggle(
            "active",
            rainbowActive
        );

        if (rainbowActive) {
            rainbowMode.textContent =
                "🌈 Arco-íris ativado";
        } else {
            rainbowMode.textContent =
                "🌈 Arco-íris";
        }
    });

    /* Cor inicial da mesa */

    changeLedColor("#00e5ff");


    /* =================================
       FORMULÁRIO DE CONTATO
    ================================= */

    const form =
        document.getElementById("contactForm");

    const nameInput =
        document.getElementById("nome");

    const emailInput =
        document.getElementById("email");

    const messageInput =
        document.getElementById("mensagem");

    const formMessage =
        document.getElementById("formMessage");

    const characterCount =
        document.getElementById("characterCount");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const message =
            messageInput.value.trim();

        formMessage.className = "";

        if (name.length < 3) {
            formMessage.textContent =
                "Digite um nome válido.";

            formMessage.className =
                "form-error";

            nameInput.focus();

            return;
        }

        const emailRule =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRule.test(email)) {
            formMessage.textContent =
                "Digite um e-mail válido.";

            formMessage.className =
                "form-error";

            emailInput.focus();

            return;
        }

        if (message.length < 10) {
            formMessage.textContent =
                "A mensagem precisa ter pelo menos 10 caracteres.";

            formMessage.className =
                "form-error";

            messageInput.focus();

            return;
        }

        formMessage.textContent =
            `Obrigado, ${name}! Sua mensagem foi enviada com sucesso.`;

        formMessage.className =
            "form-success";

        form.reset();

        characterCount.textContent =
            "0/500 caracteres";
    });

    messageInput.addEventListener("input", () => {
        characterCount.textContent =
            `${messageInput.value.length}/500 caracteres`;
    });


    /* =================================
       ANIMAÇÃO DAS SEÇÕES
    ================================= */

    const revealElements =
        document.querySelectorAll(".reveal");

    const revealObserver =
        new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(
                            "visible"
                        );
                    }
                });
            },
            {
                threshold: 0.15
            }
        );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });


    /* =================================
       MENU ATIVO
    ================================= */

    const sections =
        document.querySelectorAll("main section");

    const navLinks =
        document.querySelectorAll("nav a");

    const sectionObserver =
        new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        navLinks.forEach((link) => {
                            link.classList.remove(
                                "active"
                            );
                        });

                        const activeLink =
                            document.querySelector(
                                `nav a[href="#${entry.target.id}"]`
                            );

                        if (activeLink) {
                            activeLink.classList.add(
                                "active"
                            );
                        }
                    }
                });
            },
            {
                threshold: 0.45
            }
        );

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });


    /* =================================
       BOTÕES DOS PLANOS
    ================================= */

    const planButtons =
        document.querySelectorAll(".plan-button");

    planButtons.forEach((button) => {
        button.addEventListener("click", () => {
            document
                .getElementById("contato")
                .scrollIntoView({
                    behavior: "smooth"
                });

            messageInput.value =
                "Tenho interesse em conhecer melhor um dos planos LumiDesk.";

            messageInput.dispatchEvent(
                new Event("input")
            );
        });
    });


    /* =================================
       ANO AUTOMÁTICO
    ================================= */

    const yearElement =
        document.getElementById("year");

    if (yearElement) {
        yearElement.textContent =
            new Date().getFullYear();
    }

});
