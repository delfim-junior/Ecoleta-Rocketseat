
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft, FiTarget } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api'

import './styles.css'

import logo from '../../assets/logo.svg'

//useEffect(() => {qual funcao quero executar?},[quando eu quero executar?])//

//Sempre que criamos um estado um objectto, precisamos
//informar o tipo de dado

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGEcityResponse {
    nome: string
}


const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
    const [selectedUF, setSelectedUF] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsApp:'',

    })

    const history = useHistory();


    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords
            setInitialPosition([latitude , longitude])
        })
    },[])


    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    },[])

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);
                setUfs(ufInitials)
            })
    }, [])

    useEffect(() => {
        if (selectedUF === '0')
            return;//NOTHING
        axios.get<IBGEcityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
            .then(async response => {
                const cityNames = response.data.map(city => city.nome);
                await setCities(cityNames)
                console.log(cityNames)
            })
    }, [selectedUF])

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        
        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        
        setSelectedCity(city);
    }

    function handleMapClick (event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target

        setFormData({...formData,[name]: value})
    }

    function handleSelectItem(id: number){
        //findIndex() => retorna um nr igual ou maior que zero!
        const alreadySelected = selectedItems.findIndex(item => item === id)
        
        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id)
            
            setSelectedItems(filteredItems);
        }else {
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsApp } = formData;

        const uf = selectedUF
        const city = selectedCity
        const [ latitude, longitude ] = selectedPosition;
        const items = selectedItems

        const data = {
            name, 
            email,
            whatsApp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        await api.post('points',data)
        history.push('/')
        alert('Ponto de colecta criado');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit = {handleOnSubmit}>
                <h1>Cadastro do ponto de colecta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input
                            onChange = {handleInputChange}
                            type="text"
                            name="name"
                            id="name"
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                onChange = {handleInputChange}
                                type="email"
                                name="email"
                                id="email"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="name">WhatsApp</label>
                            <input
                                onChange = {handleInputChange}
                                type="text"
                                name="whatsApp"
                                id="whatsapp"
                            />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>endereço</h2>
                        <span>Seleccione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={12} onClick = {handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                onChange={handleSelectUF}
                                value={selectedUF}
                                name="uf"
                                id="uf"
                            >
                                <option value="0">Seleccione uma uf</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select onChange = {handleSelectCity} name="city" id="city">
                                <option value="0">Seleccione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))
                                }
                            </select>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de colecta</h2>
                        <span>Seleccione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick = {() => handleSelectItem(item.id)}
                                    className = {selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    <img src={item.image_url} alt={item.title} />
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }


                    </ul>
                </fieldset>

                <button type="submit">
                    Registar ponto de colecta
                </button>
            </form>
        </div>
    )
};

export default CreatePoint;