const API_BASE_URL = 'http://localhost:7062';

window.API_URLS = {
    TICKETS: `${API_BASE_URL}/api/Tickets`,
    CLOTHINGS: `${API_BASE_URL}/api/Clothings`,
    ACCESSORIES: `${API_BASE_URL}/api/Accessories`,
    PRODUCTS: `${API_BASE_URL}/api/Products`,
    PRODUCT_GENRES: `${API_BASE_URL}/api/ProductGenres`,
    CONCERTS: `${API_BASE_URL}/api/Concerts`,
    MANUFACTURERS: `${API_BASE_URL}/api/Manufacturers`,
    GENRES: `${API_BASE_URL}/api/Genres`,
    ARTISTS: `${API_BASE_URL}/api/Artists`,
    ARTIST_MERCH: `${API_BASE_URL}/api/ArtistMerches`,
    ARTIST_CONCERTS: `${API_BASE_URL}/api/ArtistConcerts`,
    PRODUCTS_FILTER: `${API_BASE_URL}/api/Products/filter`,
    USERS: `${API_BASE_URL}/api/Users`,
    WISHLISTS: `${API_BASE_URL}/api/Wishlists`,
    CARTS: `${API_BASE_URL}/api/Carts`,
    REVIEWS: `${API_BASE_URL}/api/Reviews`,
    ORDERS: `${API_BASE_URL}/api/Orders`,
    ARTISTS_FILTER: `${API_BASE_URL}/api/Artists/filter`,
    CONCERTS_FILTER: `${API_BASE_URL}/api/Concerts/filter`,
    CONCERTS_ARTISTS: `${API_BASE_URL}/api/Concerts/filter/artists`,
    PRODUCT_NAMES: `${API_BASE_URL}/api/Products/filter/names`
};

window.APP_CONSTANTS = {
    POPULAR_COUNTRIES: [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
        "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
        "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
        "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
        "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
        "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
        "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos",
        "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
        "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
        "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
        "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
        "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
        "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
        "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
        "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
        "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
        "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
        "UK", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ],
    POPULAR_LANGUAGES: [
        "English", "Russian", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean",
        "Arabic", "Hindi", "Turkish", "Dutch", "Polish", "Swedish", "Norwegian", "Danish", "Finnish", "Greek", "Czech",
        "Hungarian", "Romanian", "Thai", "Vietnamese", "Indonesian", "Hebrew", "Persian", "Ukrainian", "Instrumental"
    ]
};

window.manufacturers = [];
window.genres = [];
window.allArtists = [];