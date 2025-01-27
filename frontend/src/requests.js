const URL = "http://localhost:5000";

// Получение всех заказов
export const fetchAllOrders = async (setData) => {
    try {
        const response = await fetch(`${URL}/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении данных');
        }

        const data = await response.json();
        setData(data);
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error.message);
        alert('Ошибка при загрузке данных: ' + error.message);
    }
};

// Добавление нового заказа
export const addOrder = async (data) => {
    try {
        const response = await fetch(`${URL}/orders/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Ошибка при добавлении заказа');
        }

        alert('Заказ успешно добавлен!');
        return 200;
    } catch (error) {
        console.error('Ошибка:', error.message);
        alert('Ошибка при добавлении заказа: ' + error.message);
    }
};

// Удаление заказа
export const deleteOrder = async (id) => {
    try {
        const response = await fetch(`${URL}/orders/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при удалении заказа');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка:', error.message);
        alert('Ошибка при удалении заказа: ' + error.message);
    }
};

// Получение списка товаров
export const fetchProducts = async (setData) => {
    try {
        const response = await fetch(`${URL}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении данных');
        }

        const data = await response.json();
        setData(data);
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error.message);
        alert('Ошибка при загрузке данных: ' + error.message);
    }
};

// Редактирование заказа
export const updateOrder = async (data) => {
    try {
        const response = await fetch(`${URL}/orders/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при изменении заказа');
        }

        return 200;
    } catch (error) {
        console.error('Ошибка:', error.message);
        throw error;
    }
};