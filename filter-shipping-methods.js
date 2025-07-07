const fs = require('fs')

const data = JSON.parse(fs.readFileSync('shipping_methods.json', 'utf-8'))

const methods = data.shipping_methods

const filtered = methods.filter(m =>
    m.countries.some(c => c.iso_2 === 'FR')
)

console.log("Méthodes disponibles en 🇫🇷 France :\n")
filtered.forEach(m => {
    console.log(`- ID: ${m.id} | ${m.name} (${m.carrier})`)
})
