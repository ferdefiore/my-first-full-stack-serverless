let mealsState = []
let ruta = 'login' //login, register, orders
let user = {}

const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s,'text/html')
    return doc.body.firstChild 
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id= "${item._id}">${item.name}</li>`)
    
    element.addEventListener('click',()=> {
        const mealsList = document.getElementById('meals-list') 
        Array.from(mealsList.children).forEach(x=> x.classList.remove('selected')) //cada vez que cliqueamos uno itera toda la lista, saca el selecte
        element.classList.add('selected') //marca selected el que fue clickeado
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })
 
    return element
}

const renderOrder = (order, meals) => {
    const orderMeal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id="${order._id}">${orderMeal.name} - ${order.user_id}</li>`)
    return element
}

const inicializaFormulario = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (event) => {
        event.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled','true')
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if (!mealIdValue){
            alert('Debe seleccionar un plato')
            submit.removeAttribute('disabled')
        }
        const order = {
          meal_id: mealIdValue,
          user_id: user._id,
        }

        fetch('https://myfirstserverless.ferdefiore.vercel.app/api/orders',{
            method: 'POST', 
            headers: {
                'Content-Type':'application/json',
                authorization: localStorage.getItem('token'),                
            },
            body: JSON.stringify(order),
        }).then(x => x.json())
          .then(respuesta => {
              const renderedOrder = renderOrder(respuesta,mealsState)
              const ordersList = document.getElementById('orders-list')
              ordersList.appendChild(renderedOrder)
              submit.removeAttribute('disabled')
              document.getElementById('meals-id').value = ''
              const mealsList = document.getElementById('meals-list') 
              Array.from(mealsList.children).forEach(x=> x.classList.remove('selected'))
            })
    }
}

const inicializaDatos = () => {
    fetch('https://myfirstserverless.ferdefiore.vercel.app/api/meals')
    .then(response => response.json())
    .then(data => {
        mealsState = data
        const mealsList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const listItemsHTML = data.map(renderItem) //map itera en data(arreglo) y por cada uno llama a renderItem con ese mismo como parametro implicito
        mealsList.removeChild(mealsList.firstElementChild) //delete loading
        listItemsHTML.forEach(element => mealsList.appendChild(element))
        submit.removeAttribute('disabled')
        
        fetch('https://myfirstserverless.ferdefiore.vercel.app/api/orders')
            .then(response => response.json())
            .then(ordersData => {
                const ordersList = document.getElementById('orders-list')
                const listOrdersHTML = ordersData.map(orderData => renderOrder(orderData, data))
                ordersList.removeChild(ordersList.firstElementChild)
                listOrdersHTML.forEach(element => ordersList.appendChild(element))
            })
    });
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token) {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializaFormulario()
    inicializaDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (event) => {
        event.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        fetch('https://myfirstserverless.ferdefiore.vercel.app/api/auth/login',{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',                
            },
            body: JSON.stringify({email,password})
        }).then(x=> x.json())
            .then(respuesta => {
                localStorage.setItem('token',respuesta.token)
                ruta = 'orders'
                return respuesta.token
            })
            .then(token => {
              return fetch('https://myfirstserverless.ferdefiore.vercel.app/api/auth/me',{
                headers: {
                    'Content-Type':'application/json',
                    authorization:token,
                }
              })    
            })
            .then(x => x.json())
            .then(fetchedUser => {
                localStorage.setItem('user', JSON.stringify(fetchedUser))
                user = fetchedUser
                renderOrders()
            })
    }
}

window.onload = () => {
    renderApp()
}

