import { useState } from "react";
import { deleteOrder } from "../../requests";
import EditOrder from "../forms/EditOrder"; // Импортируем компонент для редактирования заказа

export default function Card({ data }) {
    const { order_id, customer_name, order_date, items } = data;
    const [isEditing, setIsEditing] = useState(false); // Состояние для отображения формы редактирования

    const handleDelete = async () => {
        if (window.confirm(`Вы уверены, что хотите удалить заказ "${customer_name}"?`)) {
            const res = await deleteOrder(order_id);
            if (res) {
                alert(res.message);
                window.location.reload();
            }
        }
    };

    return (
        <div className="card-block">
            {isEditing ? (
                <EditOrder
                    setShown={setIsEditing}
                    initialData={data} // Передаем данные заказа для редактирования
                />
            ) : (
                <>
                    <div className="card-block-title">
                        <h2 className="card-block-title-name">
                            {customer_name}
                        </h2>
                        <div>
                            <img
                                src="/images/icon-edit.png" // Иконка для редактирования
                                onClick={() => setIsEditing(true)}
                                className="card-block-title-edit-button"
                                alt="Изменить"
                            />
                            <img
                                src="/images/icon-delete.png"
                                onClick={handleDelete}
                                className="card-block-title-delete-button"
                                alt="Удалить"
                            />
                        </div>
                    </div>
                    <div className="card-block-subtitle">
                        Дата заказа: {new Date(order_date).toLocaleDateString()}
                    </div>
                    <div className="card-block-subtitle">
                        Позиции заказа:
                    </div>
                    {items.length > 0 ? (
                        <div className="card-block-tasks-list">
                            {items.map((item, index) => (
                                <div key={index} className="inner-card-block">
                                    <div className="inner-card-block-title">
                                        <span className="inner-card-block-name">
                                            {item.product_name} - {item.quantity} шт.
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card-block-tasks-title">Нет позиций</div>
                    )}
                </>
            )}
        </div>
    );
}