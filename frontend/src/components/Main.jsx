import { useEffect, useState } from "react";
import { fetchAllOrders, addOrder } from "../requests";
import Card from "./ui/Card";
import AddOrder from "./forms/AddOrder";

export default function Main({ visibleState }) {
    const { shown, setShown, shown2, setShown2 } = visibleState;
    const [orders, setOrders] = useState([]);

    // Загрузка заказов при монтировании компонента
    useEffect(() => {
        fetchAllOrders(setOrders);
    }, []);

    // Функция для переключения на следующий день
    const handleNextDay = async () => {
        try {
            const response = await fetch('http://localhost:5000/date/next-day', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при переключении даты');
            }

            alert('Дата успешно переключена, заказы отгружены, остатки обновлены');
            window.location.reload(); // Перезагружаем страницу для обновления данных
        } catch (error) {
            console.error('Ошибка:', error.message);
            alert('Ошибка при переключении даты: ' + error.message);
        }
    };

    return (
        <main className="main-block">
            {/* Форма для добавления заказа */}
            {shown && (
                <div className="main-block-form">
                    <AddOrder setShown={setShown} requestFunction={addOrder} />
                </div>
            )}

            {/* Список заказов */}
            <div className="main-block-list">
                {orders.map((order, index) => (
                    <Card key={index} data={order} />
                ))}
            </div>
        </main>
    );
}