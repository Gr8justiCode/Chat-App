'use strict';

const socket = io(),
    $form = document.querySelector('form'),
    $msgInput = document.querySelector('input'),
    $shareLocationBtn = document.querySelector('#shareLocation'),
    $template = document.querySelector('#template').innerHTML,
    $renderTemplate = document.querySelector('#render-template'),
    $locateMe = document.querySelector('#locate-me').innerHTML;

// listens for data from server
socket.on('message', ({ result, time }) => {
    // procedure for rendering output on the dom
    const html = Mustache.render($template, {
        message: result,
        createdAt: moment(time).format('H:mm')
    });
    $renderTemplate.insertAdjacentHTML('beforeend', html);
});

socket.on('link', ({ result, time }) => {
    const html = Mustache.render($locateMe, {
        location: result,
        createdAt: moment(time).format('H:mm')
    });
    $renderTemplate.insertAdjacentHTML('beforeend', html);
});

$form.addEventListener('submit', (e) => {
    // prevents page from reloading and loosing inputed data
    e.preventDefault();
    $form.setAttribute('disabled', 'disabled');
    
    let message = $msgInput.value;

    // sends data to server
    socket.emit('sendMessage', message, (error) => {
        $form.removeAttribute('disabled');
        $msgInput.value = null;
        $msgInput.focus();

        if (error)
            return console.log(error);
        
        console.log('Delivered!');
    });
});

$shareLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation)
        return alert('Your browser does not support location sharing!');
    
    $shareLocationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        socket.emit('sendLocation', {
            latitude,
            longitude
        }, () => {
            $shareLocationBtn.removeAttribute('disabled');
            console.log('Location shared')
        });
    });
});