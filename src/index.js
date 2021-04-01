const SERVER_URL = 'http://localhost:8080/table'
// const SERVER_URL = 'test.txt'



$(() => {
    var $form = $('form')
    var $section = $('section')
    
    var $name = $form.find('#name')
    var $email = $form.find('#e-mail')
    var $comment = $form.find('#comment') 
    var $role = $form.find('#role')
    var $dob = $form.find('#dob')
    var $gender = $form.find('#gender')
    
    var $displayContent = $section.find('#display-content')

    var $displayName = $('#display-name')
    var $displayEmail = $('#display-email')
    var $displayRole = $('#display-role')
    var $displayDOB = $('#display-dob')
    var $displayGender = $('#display-gender')

    var $storeBtn = $section.find('#store-btn')
    var $retrieveBtn = $section.find('#retrieve-btn')


    $().ajaxError((e,jqxhr,settings,err)=>{
        alert(`there was an Ajax error: ${err}`)
        console.log(e)
    })


    $storeBtn.on('click', async () => {
        try {
            var val = await jqRequest('post',{msg: 'store'},SERVER_URL)
            console.log(`arriba ${val}`)
            $comment.val(val)
        }catch(err){
            console.log(`arriba pero en el catch ${err}`)
            
            console.error(`Error with da Promise: ${err}`)
        }
    })

    $retrieveBtn.on('click', async () => {
        try {
            var val = await jqRequest('get',{msg: 'retrieve'},SERVER_URL)
            $comment.val(val)
        }catch(err){
            console.error(`Error with da Promise: ${err}`)
        }
    })
    
    $form.on('submit', (ev) => {
            
        ev.preventDefault()
            
            
        let name = $name.val().trim()
        let email = $email.val().trim()
        let role = $role.val()
        let dob = $dob.val()
        let gender = $gender.find('input[name="gender"]:checked').val()
        var nameValid,emailValid,dobValid,roleValid,genderValid
        let comment = $comment.val().trim()
        
        if (name === '') {
            $name.removeClass('success')
            $name.addClass('error')
            nameValid = false

        } else {
            $name.removeClass('error')
            $name.addClass('success')
            nameValid = true
            $('#display-username').text(name)
        }

        if (email === '') {
            $email.removeClass('success')
            $email.addClass('error')
            emailValid = false

        } else if (!isEmail(email)) {
            $email.removeClass('success')
            $email.addClass('error')
            emailValid = false

        } else {
            $email.removeClass('error')
            $email.addClass('success')
            emailValid = true

        }

        if (role === 'none'){
            $role.removeClass('success')
            $role.addClass('error')
            roleValid = false

        } else {
            $role.removeClass('error')
            $role.addClass('success')
            roleValid = true

        }

        if (dob === ''){
            $dob.removeClass('success')
            $dob.addClass('error')
            dobValid = false

        }else {
            let parts = dob.split("-");
            var dtDOB = new Date(parts[0],parts[1],parts[2]);
            var dtCurrent = new Date();
            if (80 < dtCurrent.getFullYear() - dtDOB.getFullYear() || dtCurrent.getFullYear() - dtDOB.getFullYear() < 18) {
                $dob.removeClass('success')
                $dob.addClass('error')
                dobValid = false

            } else {
                $dob.removeClass('error')
                $dob.addClass('success')
                dobValid = true

            }
            
        }

        if (gender === undefined){
            $gender.removeClass('success')
            $gender.addClass('error')
            genderValid = false

        } else {
            $gender.removeClass('error')
            $gender.addClass('success')
            genderValid = true

            
        }
        
        if (nameValid && emailValid && roleValid && dobValid && genderValid){
            
            let toAppend = `<tr>
                            <td>${name}</td>
                            <td>${email}</td>
                            <td>${role}</td>
                            <td>${dob}</td>
                            <td>${gender}</td>
                            </tr>`
            $displayContent.append(toAppend)
            
            let dataJSON = {
                name,
                email,
                role,
                dob,
                gender
            }

            jqRequest('POST',dataJSON,SERVER_URL)

            

            $name.val('')
            $email.val('')
            $comment.val('') 
            $role.val('none')
            $dob.val(undefined)
            $gender.find("input:radio[name=gender]:checked").prop('checked', false)

            // $gender.find("input:radio[name=gender]:checked")[0].checked = false;

            $name.removeClass('success')
            $email.removeClass('success')
            $comment.removeClass('success') 
            $role.removeClass('success')
            $dob.removeClass('success')
            $gender.removeClass('success')
        }
    
    })

})

const isEmail = function(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

const jqRequest = function (method, data, url){
    data = JSON.stringify(data)
    return $.ajax({
        url,
        method,
        data,
        contentType: 'application/json',
        // dataType: 'json'
    })
    .then((res)=>{
        console.log(`response from server: ${res.body}`)
        return res.body
    })
    .fail((res)=>{
        console.error(`request error: ${res}`)
        console.log(res)
        return res
    })
}
