//=========================================================================================
//=========================================================================================
//=========================================================================================
//======================================FROM AN INTERVIEW==========================================

function getBooks() {
    return new Promise((resolve, reject) => {
        let condition = true
        if (condition) {
            resolve([
                {
                    author: 'one',
                    bookId: 1
                },
                {
                    author: 'two',
                    bookId: 2
                }
            ])
        } else {
            reject('error')
        }
    })
}
let authors = []
let ids = []

getBooks()
    .then(data => {
        console.log('data straigth from function call') //4 to print
        data.forEach(el => {
            authors.push(el.author)
            ids.push(el.bookId)
        })
    })
    .catch(err => console.log(err))

const mypromise2 = getBooks() //mypromise2 actually holds a fullfiled or rejected promise with the state holding resolved or rejected results, but the only way to access those results is with methods then() or catch() or finally()

const res3 = mypromise2.then(data => {
    console.log('inside promise1', data) //5 to print
})
mypromise2.then(data => {
    console.log('inside promise2', data) //6 to print
})

console.log('author and ids', authors, ids) //1 to print
console.log('mypromise2', mypromise2) //2 to print
console.log('res3', res3) //3 to print, promise with status of pending

//=========================================================================================
//=========================================================================================
//=========================================================================================
//======================================CALLBACKS==========================================

function loadScripts1(src) {
    //this is with callback
    let script = document.createElement('script')
    script.src = src
    document.head.append(script)
} // calling this will do this normally, create script tag, add src and add to head element, but it dosen't tell when the script finishes loading by the browser, so if we need to use something from the script just below this functions it will problably break, so we need a callback

function tellWhenFinishLoading(src, cb) {
    let script = document.createElement('script')
    script.src = src

    script.onload = () => cb(null) //call me back after script loads this is async
    script.onerror = () =>
        cb(new Error(`Throwing error for loading fail for ${src}`))
    document.head.append(script)
}
function callmeback(error) {
    if (error) {
        alert(error)
        //handle error code
    } else {
        //call functionsFromScriptsLoaded
        //handle load script success
    }
}
tellWhenFinishLoading('./script.js', callmeback) //this sort of structure of callback using this errors sequence is a design pattern called error first callback or something like that

//=========================================================================================
//=========================================================================================
//=========================================================================================
//======================================CLOSURES===========================================

const closureParent = () => {
    return function closureChild() {
        setTimeout(() => console.log('inside closure child'), 3000)
    }
}
let vessel1 = closureParent() //inside function will NOT run now
console.log(vessel1()) //vessel1(), only now the function inside will run while a promise would have run when the parent function was invoked

//=========================================================================================
//=========================================================================================
//=========================================================================================
//======================================PROMISES===========================================

function loadScriptsPromise(src) {
    // example of the load script with promises
    return new Promise((resolve, reject) => {
        let script = document.createElement('script')
        script.src = src

        script.onload = resolve() //this will not work, it needs to be a function () => resolve(), the onload expects an function
        script.onerror = reject(new Error('error loading scripts')) //this will not work, it needs to be a function () => reject(), the onerror expects an function
        document.head.append(script)
    })
}
loadScriptsPromise('./script.js').then(() => functionFromScript('lala')) //this will throw an ReferenceError: functionFromScript is not defined due the observations above on the script.onload and script.onerror

function loadScriptsPromiseChaining(src) {
    //the right way
    return new Promise((resolve, reject) => {
        let script = document.createElement('script')
        script.src = src

        script.onload = () => resolve()
        script.onerror = () => reject(new Error('error loading scripts'))
        document.head.append(script)
    })
}

loadScriptsPromiseChaining('./script.js') // example of loading scripts one by one to practice promise chaining
    .then(() => loadScriptsPromiseChaining('./script2.js'))
    .then(() => loadScriptsPromiseChaining('./script3.js'))
    .then(() => functionFromScript('running from loaded script'))
// the then() method actually returns a object that is not a promise per se, so when first the method then() returns something, Javascript will look if that result has a method then defined inside, and if it does, it will be called and that method has 2 native arguments as parameters: a resolver and a reject native functions, so JS will wait until one of them is called, and only then, pass the result to the next .then() in chain.
//The new Promise comes with the method then() that has a Thenable object that has a then() in it.
// that way of writing arrow functions is just a shorthand for: function(){return loadScriptsPromiseChaining('./script2.js')} --> () => { return loadScriptsPromiseChaining('./script2.js')} --> () => loadScriptsPromiseChaining('./script2.js')

//more real example with fetch()
const url = 'https://randomuser.me/api/'
let promise = fetch(url)
console.log('fetch promise', promise) //Promise object with PromiseState of fullfilled and PromiseResults holding a Response object
// the fetch method is just like any other function that returns a promise so like: function fetch(){return new Promise((resolve, reject) => { creates https request and all and code and code and then the results are back, check for error, no error? resolve(results) })}
//so in this case the variable 'let promise' will hold a Promise with the PromiseState of 'fullfilled' and the PromiseResult with the results
//now, we know that, after a promise is fullfilled or rejected we can access the result of that, with a method then() and catch()
//Note: the catch() is just syntatic sugar for .then(undefined, errorHandler), because in actuallity the .then() can take 2 arguments, .then(onSuccess, onReject), the thing is that the then method passes down the result or the error, so if you do like: fetch(url).then(success, error) it will work normally for a success or error but if in the middle of the execution of the success function there is an problem and ends in error, there nothing down the chain to catch it, while if you do: fetch(url).then(success).catch(error), any error will be handled.
//going back to the request, the promise is resolved with a response object, you can apply several methods to it, like .text(), that will return another promise with the resolved results of that.
//one of the most used methods is the .json(), that will parse the string, constructing the JavaScript value or object described by the string.
promise
    .then(results => results.json())
    .then(data => {
        console.log(
            'data parsed from fetch request, this is data.results[0], user info: ',
            data.results[0]
        )
        return data.results
    })
    .then(somethin =>
        console.log(
            'why I can append a then() here? Its because this .then() is coming from a new Promise() created by the original fetch call, so all of these .then() already have the Thenable object with the then() on it, it is just underneath the surface here, return Thenable{constructor(){} then((resolve,reject)){resolve(data.results)}} is the same as return data.results',
            somethin
        )
    )

//now let us make a fetch call to github api to get my info, ThiagoIII
const url2 = 'https://api.github.com/users/ThiagoIII'
fetch(url2)
    .then(results => results.json())
    .then(data => {
        const img = document.createElement('img')
        img.src = data.avatar_url
        document.body.append(img)
    })

//if we want to make some action wait another one we just the first in another promise like:
fetch('https://api.github.com/users/ThiagoIII')
    .then(results => results.json())
    .then(
        data =>
            new Promise((resolve, reject) => {
                const img = document.createElement('img')
                img.src = data.avatar_url
                document.body.append(img)
                setTimeout(() => {
                    img.remove()
                    resolve(data)
                }, 4000)
            })
    )
    .then(data => console.log(`img from ${data.login} removed`))

//As a good practice, an asynchronous action should always return a promise.
//It is good as well to break the chain down in reusable functions, to be like reusable components, like:

function getUserGeneralInfoPromise(url) {
    return fetch(url)
        .then(results => results.json)
        .then(data => data.results[0].name.first)
}
// or:
async function getUserGeneralInfoAsync(url) {
    const results = await fetch(url)
    return results.json
}

function loadGithubInfo(userName) {
    //the userName goes in the ThiagoIII place as string interpolation
    return fetch(`https://api.github.com/users/ThiagoIII`).then(userInfo =>
        userInfo.json()
    )
}
// or:
async function loadGithubInfoAsync(userName) {
    const results = await fetch(`https://api.github.com/users/${userName}`)
    return results.json
}

function appendHtml(src) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.src = src

        document.body.append(img)

        setTimeout(() => {
            img.remove()
            resolve('image removed')
        }, 5000)
    })
}

getUserGeneralInfoAsync('https://randomuser.me/api')
    .then(userName => loadGithubInfo(userName))
    .then(data => appendHtml(data.avatar_url))
    .then(msg => console.log(msg))
    .catch(err => console.log(err))

//the call of .then(handler) always returns a promise

new Promise((resolve, reject) => {
    throw new Error('Whoops!')
})
    .catch(function (error) {
        if (error instanceof URIError) {
            null
        } else {
            null
            throw error
        }
    })
    .then(function () {})
    .catch(error => {
        console.log('some error', error)
    })
//so you can chain then and catch

new Promise((resolve, reject) => {
    throw new Error('Whoops!')
})
    .catch(function (error) {
        if (error instanceof URIError) {
            null
        } else {
            console.log('this is from a catch block, part 1', error)
            return 'normal flow'
        }
    })
    .then(function (msg) {
        console.log(
            'this is from a then block, part 2, normal flow with a mix of then and catch :',
            msg
        )
        throw new Error('whoops 2!')
    })
    .catch(error => {
        //this will run 2 times because there are 2 erros
        console.log('some error', error)
    })
//so all the catch blocks from where the error was throw will be activated and if there is more than one error 'acumulated' the further down the chain the catch block is the more times it will be run, it will run one time for each error

// promise.all(), it takes an iterable object of PROMISES and runs all of them and applies the .then() on each of them to get the result in the resolve method, creating an array of results, it will be ready only when all of them are ready, if any error it rejects all of them with a single reject result
let urls = [
    'https://api.github.com/users/iliakan',
    'https://api.github.com/users/remy',
    'https://api.github.com/users/jeresig'
]
let users1 = []
// map every url to the promise of the fetch

let requests = urls.map(url => fetch(url))

requests.forEach(proms =>
    proms.then(data => data.json()).then(user => users1.push(user))
) //this is sort of how the .all works.

console.log('users1', users1)

Promise.all(requests).then(data => console.log('inside promise.all', data)) // array of response objects because the return of fetch is that response object

// promise.allSettled, promise.any and promise.race works about the same way, its pretty straightfoward, allSettled returns an array with all the results, reject or fullfilled, any will waits for the first fullfilled and race will waits for the first one either fullfilled or error

// simple example using Promise.resolve(), the same with Promise.reject()
let cache = new Map()

function loadCached(url) {
    if (cache.has(url)) {
        return Promise.resolve(cache.get(url)) // (*)
    }

    return fetch(url)
        .then(response => response.text())
        .then(text => {
            cache.set(url, text)
            return text
        })
}

//Turning callback-base functions into promise-based function

/* function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
  
    script.onload = () => callback(null, script);
    script.onerror = () => callback(new Error(`Script load error for ${src}`));
  
    document.head.append(script);
  } */
// loadScript('path/script.js', (err, script) => {...})

//turn into a promise based function
/* function loadScriptPromised(src) {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script')
        script.src = src
        script.onload = () => resolve(script)
        script.onerror = () =>
            reject('====================error on load promised function script')
        document.head.append(script)
    })
}

loadScriptPromised('./script.js')
    .then(src =>
        console.log(
            '===============================using function inside loaded script'
        )
    )
    .catch(err => console.log(err)) */

//or we can keep the error-first approach like this
/* function loadScriptPromisedOutside(src) {
    return new Promise((resolve, reject) => {
        loadScriptPromised(src, cb, resolve, reject)
    })
}
function cb(err, scrip, resolve, reject) {
    return err ? reject(err) : resolve(scrip)
}
function loadScriptPromised(src, cb, resolve, reject) {
    let script = document.createElement('script')
    script.src = src
    script.onload = () => cb(null, script, resolve, reject)
    script.onerror = () => cb('error', null, resolve, reject)
    document.head.append(script)
}

loadScriptPromisedOutside('./script.js')
    .then(src => console.log('====================='))
    .catch(err => console.log('error ===============================')) */
