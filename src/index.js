const SERVER_URL = 'http://localhost:8080/table'
var idArray  = []



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

    var $deleteBtn = $section.find('#delete-btn')
    var $retrieveBtn = $section.find('#retrieve-btn')

    $displayContent.children().on('click','tr', (ev) => {
        if(ev.target.parentNode !== $displayContent.find('tr:first')[0])
            $(ev.target.parentNode).toggleClass('selected')
            
            // ev.target.parentNode.classList.toggle('selected')
    })
    $().ajaxError((e,jqxhr,settings,err)=>{
        alert(`there was an Ajax error: ${err}`)
        console.log(e)
    })

    retrieveFromDB($displayContent)
        .then(msg => {
            $comment.val(msg)
        })
        .catch(err => $comment.val(err))

    $deleteBtn.on('click', async () => {

        var $selected = $displayContent.find('.selected')
 
        let idsSelected = await getIdsToDelete($selected)


        jqRequest('delete',{msg: idsSelected},SERVER_URL)
            .then(val => {
                $comment.val(val)
                $selected.remove()
            })
            .catch(err => {
                $comment.val(err.error)

            })
        
    })

    // $retrieveBtn.on('click', async () => {
    //     try {
    //         var val = await jqRequest('get',{msg: ''},SERVER_URL)
    //         console.log(val)
    //         $displayContent.find('tr:first').siblings().remove()
    //         $displayContent.append(formatData(val))

    //         $comment.val(val)
    //     }catch(err){
    //         console.error(`Error with da Promise: ${err}`)
    //     }
    // })
    
    $form.on('submit', (ev) => {
            
        ev.preventDefault()
            
            
        let name = $name.val().trim()
        let email = $email.val().trim()
        let role = $role.val()
        let dob = $dob.val()
        let gender = $gender.find('input[name="gender"]:checked').val()
        var nameValid,emailValid,dobValid,roleValid,genderValid
        
        nameValid = validateName(name,$name)
        emailValid = validateEmail(email,$email)
        roleValid = validateRole(role,$role)
        dobValid = validateDOB(dob,$dob)
        genderValid = validateGender(gender,$gender)
        
        
        if (nameValid && emailValid && roleValid && dobValid && genderValid){
                            
            let dataJSON = {
                name,
                email,
                role,
                dob,
                gender
            }

            
            jqRequest('POST',dataJSON,SERVER_URL)
                .then( (res) => {
                    $displayContent.append(formatData(dataJSON))
                    saveId(res)
                    resetForm($name,$email,$comment,$role,$dob,$gender)
                })
                .catch( err => {
                    $comment.val(`Couldnt reach server ${err}`)
                })


            
        }
    
    })

})

const isEmail = function(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

const jqRequest = function (method, data, url){
    data = JSON.stringify(data)
    return new Promise((resolve,reject) => {
        $.ajax({
            url,
            method,
            data,
            contentType: 'application/json',
            // dataType: 'json'
        })
        .then((res)=>{
            resolve(res.body) 
        })
        .fail((res)=>{
            reject(res.responseJSON) 
        }) 
    }) 
}

const formatData = function(data){

    if (!Array.isArray(data))
        data = [data]
    let jsonToHTML = data.map((obj) => {
        let date = new Date(obj.dob)
        date = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
        return `<tr>
        <td hidden>${obj._id}</td>
        <td>${obj.name}</td>
        <td>${obj.email}</td>
        <td>${obj.role}</td>
        <td>${date}</td>
        <td>${obj.gender}</td>
        </tr>`
    })
    return jsonToHTML.join('')
}

function retrieveFromDB ($table){
    return new Promise((resolve,reject) => {
        jqRequest('get',{msg: ''},SERVER_URL)
            .then(data => {
                $table.find('tr:first').siblings().remove()
                $table.append(formatData(data))
                saveId(data)
                resolve(`Everything is working fine`)
            })
            .catch(err => {
                console.error(`Couldnt reach Server: ${err}`)
                reject(`Couldnt reach Server`)
            })

    })
}
function saveId (data) {
    if (!Array.isArray(data))
        data = [data]
    data.forEach((obj) => {
       idArray.push({
            _id: obj._id
        }) 
    }) 
    
}

function getIdsToDelete($selected){
    let idArray = []
        
    $selected.find('td:hidden')
        .each((index,elem) => {
            idArray.push(elem.innerHTML)
        })
    return idArray
}

function validateName(name,$name) {
    if (name === '') {
        $name.removeClass('success')
        $name.addClass('error')
        return false

    } else {
        $name.removeClass('error')
        $name.addClass('success')
        return true
    }

}
function validateEmail(email,$email) {
    if (email === '') {
        $email.removeClass('success')
        $email.addClass('error')
        return false
    
    } else if (!isEmail(email)) {
        $email.removeClass('success')
        $email.addClass('error')
        return false
    
    } else {
        $email.removeClass('error')
        $email.addClass('success')
        return true
    
    }

}

function validateRole(role,$role) {
    if (role === 'none'){
        $role.removeClass('success')
        $role.addClass('error')
        return false

    } else {
        $role.removeClass('error')
        $role.addClass('success')
        return true

    }
}

function validateDOB (dob,$dob) {
    if (dob === ''){
        $dob.removeClass('success')
        $dob.addClass('error')
        return false

    }else {
        let parts = dob.split("-");
        var dtDOB = new Date(parts[0],parts[1],parts[2]);
        var dtCurrent = new Date();
        if (80 < dtCurrent.getFullYear() - dtDOB.getFullYear() || dtCurrent.getFullYear() - dtDOB.getFullYear() < 18) {
            $dob.removeClass('success')
            $dob.addClass('error')
            return false

        } else {
            $dob.removeClass('error')
            $dob.addClass('success')
            return true

        }
        
    }
}

function validateGender (gender,$gender) {
    if (gender === undefined){
        $gender.removeClass('success')
        $gender.addClass('error')
        return false

    } else {
        $gender.removeClass('error')
        $gender.addClass('success')
        return true
        
    }
}

function resetForm (name,email,comment,role,dob,gender) {
    name.val('')
    email.val('')
    comment.val('') 
    role.val('none')
    dob.val(undefined)
    gender.find("input:radio[name=gender]:checked").prop('checked', false)

    name.removeClass('success')
    email.removeClass('success')
    comment.removeClass('success') 
    role.removeClass('success')
    dob.removeClass('success')
    gender.removeClass('success')
}

