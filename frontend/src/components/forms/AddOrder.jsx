import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../../requests';

export default function AddOrder({ setShown, requestFunction }) {
    const [newData, setNewData] = useState({
        customer_name: '',
        order_date: new Date().toISOString().split('T')[0],
        items: [],
    });

    const [productsList, setProductsList] = useState([]);

    useEffect(() => {
        fetchProducts(setProductsList);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newData.items];
        updatedItems[index][field] = value;
        setNewData((prevData) => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    const addItem = () => {
        setNewData((prevData) => ({
            ...prevData,
            items: [...prevData.items, { product_id: '', quantity: 1 }],
        }));
    };

    const removeItem = (index) => {
        const updatedItems = newData.items.filter((_, i) => i !== index);
        setNewData((prevData) => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const orderData = {
            customer_name: newData.customer_name,
            order_date: newData.order_date,
            items: newData.items,
        };

        try {
            const response = await fetch('http://localhost:5000/orders/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении заказа');
            }

            alert('Заказ успешно добавлен!');
            setShown(false);
            window.location.reload();
        } catch (error) {
            console.error('Ошибка:', error.message);
            alert('Ошибка при добавлении заказа: ' + error.message);
        }
    };
    return (
        <div className="form-block">
            <h3>Добавление заказа</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-input-block">
                    <label htmlFor="customer_name">ФИО заказчика:</label>
                    <input
                        name="customer_name"
                        type="text"
                        placeholder="Иванов Иван Иванович"
                        value={newData.customer_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input-block">
                    <label htmlFor="order_date">Дата заказа:</label>
                    <input
                        name="order_date"
                        type="date"
                        value={newData.order_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-subtitle">Позиции заказа:</div>
                {newData.items.map((item, index) => (
                    <div key={index} className="form-item-block">
                        <div className="form-select-block">
                            <label htmlFor={`product_id_${index}`}>Товар:</label>
                            <select
                                name={`product_id_${index}`}
                                value={item.product_id}
                                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>--Выберите товар--</option>
                                {productsList.map((product) => (
                                    <option key={product.product_id} value={product.product_id}>
                                        {product.product_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-input-block">
                            <label htmlFor={`quantity_${index}`}>Количество:</label>
                            <input
                                name={`quantity_${index}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                required
                            />
                        </div>
                        <button className="unfiled-button" type="button" onClick={() => removeItem(index)}>Удалить</button>
                    </div>
                ))}
                <button className="filed-button" type="button" onClick={addItem}>Добавить позицию</button>
                <div className="buttons-block">
                    <button className="grey-button" type="button" onClick={() => setShown(false)}>Отменить</button>
                    <button className="filed-button" type="submit">Добавить</button>
                </div>
            </form>
        </div>
    );
}