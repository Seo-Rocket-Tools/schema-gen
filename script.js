
document.querySelector('#add_location_button').addEventListener('click', () =>{
    const serviceWrapper = document.createElement('div')
    serviceWrapper.className = 'service'

    serviceWrapper.innerHTML = `<div class="input-group">
    <label>name</label>
    <input type="text" required name="service-name">
</div>
<div class="input-group">
    <label>url</label>
    <input type="text" required name="service-url">
</div>
<div class="input-group">
    <label>description</label>
    <input type="text" required name="service-description">
</div>`

    const removeButton = document.createElement('span')
    removeButton.className = 'remove-button'
    removeButton.innerHTML = 'remove'
    removeButton.addEventListener('click', () => {
        document.querySelector('#services-list').removeChild(serviceWrapper)
    })
    serviceWrapper.prepend(removeButton)

    document.querySelector('#services-list').appendChild(serviceWrapper)
})


document.querySelector('#add_service_area').addEventListener('click', () => {
    const serviceAreaWrapper = document.createElement('div')
    serviceAreaWrapper.className = 'service-area'

    serviceAreaWrapper.innerHTML = `<div class="input-group">
    <label>country</label>
    <input type="text" required name="service-area-country">
</div>
<div class="input-group">
    <label>state</label>
    <input type="text" required name="service-area-state">
</div>
<div class="input-group">
    <label>cityTown</label>
    <input type="text" required name="service-area-cityTown">
</div>
<div class="input-group">
    <label>url</label>
    <input type="text" required name="service-area-url">
</div>
<div class="input-group">
    <label>zipCodes</label>
    <textarea name="service-area-zipCodes" cols="30" rows="10"></textarea>
</div>`

    const removeButton = document.createElement('span')
    removeButton.className = 'remove-button'
    removeButton.innerHTML = 'remove'
    removeButton.addEventListener('click', () => {
        document.querySelector('#service-areas-list').removeChild(serviceAreaWrapper)
    })
    serviceAreaWrapper.prepend(removeButton)

    document.querySelector('#service-areas-list').appendChild(serviceAreaWrapper)
})

// Form submit
document.querySelector('#inputForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.target

    const payload = {
        schemaType: form.schemaType.value,
        businessName: form.businessName.value,
        websiteURL: form.websiteURL.value,
        imageURL: form.imageURL.value,
        slogan: form.slogan.value,
        description: form.description.value,
        disambiguatingDescription: form.disambiguatingDescription.value,
        streetAddress: form.streetAddress.value,
        cityTown: form.cityTown.value,
        state: form.state.value,
        zipCode: form.zipCode.value,
        country: form.country.value,
        phone: form.phone.value,
        email: form.email.value,
        query: form.query.value,
        keywords: form.keywords.value.split(',').map(keyword => keyword.trim()),
        ownersName: form.ownersName.value,
        privacyPolicyURL: form.privacyPolicyURL.value,
        backlinks: extractByLine(form.backlinks.value),
        aboutPages: extractByLine(form.otherPages.value),
        services: [],
        areasServed: []
    }

    const serviceElementsCount = document.querySelectorAll('#services-list .service').length

    for (let index = 0; index < serviceElementsCount; index++) {
        payload.services.push({
            name: document.getElementsByName("service-name")[index].value,
            url: document.getElementsByName("service-url")[index].value,
            description: document.getElementsByName("service-description")[index].value
        })
    }

    const serviceAreaElementCount = document.querySelectorAll('#service-areas-list .service-area').length

    if (serviceAreaElementCount > 0) {
        for (let index = 0; index < serviceAreaElementCount; index++) {
            payload.areasServed.push({
                country: document.getElementsByName("service-area-country")[index].value,
                state: document.getElementsByName("service-area-state")[index].value,
                cityTown: document.getElementsByName("service-area-cityTown")[index].value,
                url: document.getElementsByName("service-area-url")[index].value,
                zipCodes: document.getElementsByName("service-area-zipCodes")[index].value.split(',').map(zipcode => zipcode.trim())
            })
        }
    }

    form.style.display = 'none'
    document.querySelector('#loading-text').style.display = 'unset'

    axios({
        method: 'post',
        url: 'https://rank-schema-plugin-server.herokuapp.com/schema-generator/build',
        data: payload
    })
    .then(res => {
        displayResults(res.data)
        console.log(`SUCCESS: ${res.data}`)
    })
    .catch(err => {
        console.log(`ERROR BUILDING SCHEMA :${err.message}`)
    })
})

function displayResults(data) {
    document.querySelector('#loading-text').style.display = 'none'
    document.querySelector('.results-view').style.display = 'inherit'

    data.schemaMap.forEach(map => {
        const resultGroup = document.createElement('div')
        resultGroup.className = 'result-group'

        const url = document.createElement('a')
        url.href = map.url
        url.innerHTML = map.url
        url.target = '_blank'
        resultGroup.appendChild(url)

        let schemaMarkup = ''

        map.indexMap.forEach(index => {
            schemaMarkup = schemaMarkup + `<!-- Schema for ${map.url}-->`
            schemaMarkup = schemaMarkup + `<script type="application/ld+json">${data.schemaMarkups[index]}</script>`
        })

        const schemaMarkupTextArea = document.createElement('textarea')
        schemaMarkupTextArea.readOnly = true
        schemaMarkupTextArea.cols = 30
        schemaMarkupTextArea.rows = 10
        schemaMarkupTextArea.innerHTML = schemaMarkup
        resultGroup.appendChild(schemaMarkupTextArea)

        const copyButton = document.createElement('span')
        copyButton.className = 'copy=button'
        copyButton.innerHTML = 'copy ⚡'
        copyButton.addEventListener('click', () =>{
            schemaMarkupTextArea.select()
            navigator.clipboard.writeText(schemaMarkupTextArea.value)
        })
        resultGroup.appendChild(copyButton)

        document.querySelector('.results-view').appendChild(resultGroup)

    })
}


function extractByLine(input) {
    const array = []
    input.split(/\n/).forEach(item => { if (item.trim() !== '') array.push(item.trim()) })
    return array
}