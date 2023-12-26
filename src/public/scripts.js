const socket = io();

socket.on('conexion-establecida', (mensaje) => {
  console.log('Mensaje del servidor:', mensaje);
  
  
});

socket.on('newProduct', (data) => {
  console.log(data)
  const productsElements = document.getElementById("products");
  console.log(productsElements)
  const productElement = document.createElement('li');
  productElement.innerHTML = `${data.title} - ${data.description}`;
  productsElements.appendChild(productElement);

});

socket.on('deleteProduct', (id) => {
  console.log(id)
  const productElement = document.getElementById(id).remove();
  console.log(productElement)
  
});

document.addEventListener("DOMContentLoaded", () => {

  // EVENTO ENVIAR FORMULARIO REGISTRO
  console.log("DOMContentLoaded se ha ejecutado correctamente.");
  
  //EVENTO BOTON DETALLE
  // busca los botones con clase detalle-buton
  const detalleButtons = document.querySelectorAll(".detalle-button");
  // agregar un evenlistener
  detalleButtons.forEach((button) => {
    
    button.addEventListener("click", function (event) {
      const productId = event.currentTarget.dataset.productId;
      window.location.href = `/product/${productId}`;
    });

  }); 



  const carritoBtn = document.getElementById("carrito-compra");

  async function obtenerIdCarrito() {
    try {
      const userResponse = await fetch("/api/carts/getusercart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
    
      if (userResponse.ok) {
        const userData = await userResponse.json();
        return userData.cartId;
      } else {
        const errorData = await userResponse.json();
        console.error('No se pudo obtener el ID del carrito:', errorData);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el ID del carrito:', error);
      return null;
    }
  }
  
  if (carritoBtn) {
    carritoBtn.addEventListener("click", async () => {
      try {
        const carritoId = await obtenerIdCarrito();
        if (carritoId) {
          window.location.href = `/cart/detail/${carritoId}`;
        } else {
          console.error("No se pudo obtener el ID del carrito.");
        }
      } catch (error) {
        console.error("Error al obtener el ID del carrito:", error);
      }
    });
  }



  /* // Obtener el botón del carrito
  const carritoBtn = document.getElementById("carrito-compra");

  //funcion para obtener token de cookies desde el cliente 
  function obtenerTokenDeCookies() {
    console.log("ejecutando funcion para obtener token")
    const cookies = document.cookie.split(";").map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => {
      const [cookieName] = cookie.split("=");
      return cookieName === "token";
    });
  
    if (tokenCookie) {
      return tokenCookie.split("=")[1];
    } else {
      return null;
    }
  }

  // Función para obtener el ID del carrito
  async function obtenerIdCarrito() {
    try {
      const token = obtenerTokenDeCookies(); // Obtener el token de las cookies
      console.log(token)
      const userResponse = await fetch("/api/sessions/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // Pasar el token en la solicitud
        }
      });
  
      if (userResponse.ok) {
        console.log(userResponse)
        const userData = await userResponse.json();
        return userData.cart; // Asegúrate de usar la propiedad correcta que contiene el ID del carrito
      } else {
        const errorData = await userResponse.json();
        console.error('No se pudo obtener el ID del carrito:', errorData);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el ID del carrito:', error);
      return null;
    }
  }
  
  // Manejar clic en el botón del carrito
  if (carritoBtn) {
    carritoBtn.addEventListener("click", async () => {
      try {
        const carritoId = await obtenerIdCarrito();
        if (carritoId) {
          window.location.href = `/cart/detail/${carritoId}`;
        } else {
          console.error("No se pudo obtener el ID del carrito.");
        }
      } catch (error) {
        console.error("Error al obtener el ID del carrito:", error);
      }
    });
  } */

  
  const formulario = document.getElementById("messageForm");
  if(formulario){
    formulario.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const nombre = document.getElementById("nombre").value;
      const apellido = document.getElementById("apellido").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const message = document.getElementById("message").value;
  
      // Verificar si el campo de mensaje está vacío
      const datos = { nombre, apellido, email, password, message };
      /* if (message.trim() !== "") {
        datos.message = message;
      } */
      
      // Enviar los datos del formulario
      try {
        const response = await fetch("/Register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos)
        });
  
        if (response.ok) {
          alert("Usuario y mensaje guardados con éxito");
          formulario.reset();
        } else {
          if(response.status === 400){
            alert("El correo ya esta registrado")
          } else {
            alert("Error al guardar el usuario y el mensaje");
          }
        }
      } catch (error) {
        console.error(error);
        alert("Error al registrarse");
      }
    });
  }
  


  
  //EVENTO LOGIN antiguo
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      // Verificar que se ingresen email y contraseña
      if (email.trim() === "" || password.trim() === "") {
        alert("Por favor, ingresa tu email y contraseña.");
        return;
      }
  
      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });
  
        if (response.ok) {
          const data = await response.json();
          const token = data.token;
          console.log("token desde script", token);
          // Almacena el token en localStorage para sesiones posteriores (opcional)
          /* localStorage.setItem("token", token); */
  
          // Determina la redirección según el rol del usuario
          const userResponse = await fetch("/api/sessions/user", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });
  
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const { rol } = userData;
  
            if (rol === "admin") {
              console.log("Redirigiendo a la página de perfil de administrador");
              window.location.href = "/profile"; // Redirige a la página de perfil de administrador
            } else {
              console.log("Redirigiendo a la página de productos para usuarios");
              window.location.href = "/allproducts"; // Redirige a la página de productos para usuarios
            }
          } else {
            alert(
              "Error al obtener información del usuario. Por favor, inténtalo de nuevo más tarde."
            );
          }
  
          // Después de haber redirigido al usuario, ahora puedes enviar el correo electrónico
          try {
            console.log("pasaporelmail")
            const message = document.getElementById("mailmessage").value;
            if (message.trim() !== "") {
              const emailResponse = await fetch("/enviar-correo", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email, mensaje: message })
              });
          
              if (emailResponse.ok) {
                const emailData = await emailResponse.json();
                console.log(emailData.message); // Mensaje del servidor después de enviar el correo
              } else {
                console.error("Error al enviar el correo");
                // Manejo de errores
              }
            } else {
              console.log("No se ha ingresado ningún mensaje. El correo no será enviado.");
            }
          } catch (error) {
            console.error("Error al enviar el correo:", error);
            // Manejo de errores
          }
        } else {
          alert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.");
        }
      } catch (error) {
        console.error(error);
        alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
      }
    });

    // Evento para la recuperación de contraseña
    const recoveryButton = document.getElementById("recoveryButton");
    if (recoveryButton) {
      recoveryButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;

        try {
          const recoveryResponse = await fetch("/recoverypass", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
          });

          if (recoveryResponse.ok) {
            const recoveryData = await recoveryResponse.json();
            alert("Se envio un enlace a su correo con exito")
            console.log(recoveryData.message); // Mensaje del servidor después de enviar la solicitud de recuperación de contraseña
          } else {
            console.error("Error al solicitar recuperación de contraseña");
            // Manejo de errores
          }
        } catch (error) {
          console.error("Error al solicitar recuperación de contraseña:", error);
          // Manejo de errores
        }
      });
    }

  }

  const resetPasswordForm = document.getElementById("resetPasswordForm");
  if(resetPasswordForm){

    resetPasswordForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Por ejemplo, verificar si las contraseñas coinciden
      if (newPassword !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      try {
        const response = await fetch("/actualizar-pass", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, newPassword })
        });
  
        if (!response.ok) {
          if (response.status === 400) {
            const data = await response.json();
            alert(data.error); // Muestra el mensaje específico del servidor
          } else if (response.status === 401) {
            alert("Tiempo de enlace expirado, redirigiendo al inicio.");
            window.location.href = "/login";
          } else {
            throw new Error('Error al actualizar la contraseña');
          }
        } else {
          const data = await response.json();
          alert("Contraseña actualizada correctamente")
          console.log(data);
        }
      } catch (error) {
        // Manejar errores
        console.error('Error:', error.message);
      }
      /* try {
        const response = await fetch("/actualizar-pass", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, newPassword })
        });
        console.log(response)
        if (!response.ok) {
          if (response.status === 401) {
            alert("Tiempo de enlace expirado,  redirigiendo alinicio.");
            window.location.href = "/login"; // Redirigir a la página de inicio de sesión
            return;
          }
          throw new Error('Error al actualizar la contraseña');
        }
  
        const data = await response.json();
        alert("Contraseña actualizada correctamente")
        console.log(data);
      } catch (error) {
        // Manejar errores
        console.error('Error:', error.message);
      } */
    
    });
  }
  

});








//EVENTO LOGIN antiguo
/* const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Verificar que se ingresen email y contraseña
  if (email.trim() === "" || password.trim() === "") {
    alert("Por favor, ingresa tu email y contraseña.");
    return;
  }

  // en la ruta tenia /api/session/login
  try {
    
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    console.log("response", response)
    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      console.log(token)
      // Almacena el token en localStorage para sesiones posteriores (opcional)
      /* localStorage.setItem("token", token); 
      
      // Determina la redirección según el rol del usuario
      const userResponse = await fetch("/api/sessions/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const { rol } = userData;

        if (rol === "admin") {
          window.location.href = "/profile"; // Redirige a la página de perfil de administrador
        } else {
          window.location.href = "/allproducts"; // Redirige a la página de productos para usuarios
        }
      } else {
        alert("Error al obtener información del usuario. Por favor, inténtalo de nuevo más tarde.");
      }
    } else {
      alert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
}); */


//EVENTO LOGIN NUEVO
/* const loginForm = document.getElementById("loginForm");
  
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Verificar que se ingresen email y contraseña
  if (email.trim() === "" || password.trim() === "") {
    alert("Por favor, ingresa tu email y contraseña.");
    return;
  }

  try {
    const response = await fetch("/api/sessions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
  
    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);
      alert("Inicio de sesión exitoso");
    
      // Realiza una nueva solicitud para obtener la información del usuario
      const userResponse = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userRole = userData.rol;
      
        if (userRole === "admin") {
          window.location.href = "/profile"; // Redirige a la página de perfil de administrador
        } else {
          window.location.href = "/allproducts"; // Redirige a la página de productos para usuarios normales
        }
      } else {
        alert("Error al obtener información del usuario. Por favor, inténtalo de nuevo.");
      }
    } else {
      alert("Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
}); */


//EVENTO LOGIN prueba
/* const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Verificar que se ingresen email y contraseña
  if (email.trim() === "" || password.trim() === "") {
    alert("Por favor, ingresa tu email y contraseña.");
    return;
  }

  try {
    const response = await fetch("/api/sessions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      console.log(token)
      await handleSuccessfulLogin(token);
    } else {
      alert("Correo o password incorrectos. Por favor, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
  }
});

async function handleSuccessfulLogin(token) {
  const response = await fetch("/api/sessions/allproducts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (response.ok) {
    alert("Inicio de sesión exitoso");
    
  } else {
    alert("Error al obtener los productos. Por favor, inténtalo de nuevo más tarde.");
  }
} */