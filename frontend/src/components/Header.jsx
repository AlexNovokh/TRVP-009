export default function Header({ visibleState }) {
    const { shown, setShown, shown2, setShown2 } = visibleState;

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
        <header className="header-block">
            <div className="header-block-left-part">
                <img src="/images/logo.svg" alt="Логотип Склада" />
            </div>
            <div className="header-block-middle-part">
                {!shown && (
                    <button
                        className="filed-button"
                        onClick={() => { setShown(true); window.scrollTo(0, 0); }}
                    >
                        Создать заказ
                    </button>
                )}
                {!shown2 && (
                    <button
                        className="filed-button"
                        onClick={() => {
                            handleNextDay(); // Вызов функции для переключения даты
                            setShown2(true); // Закрываем кнопку, если нужно
                            window.scrollTo(0, 0); // Прокрутка вверх
                        }}
                    >
                        Перейти на следующий день
                    </button>
                )}
            </div>
            <div className="header-block-right-part">
                <img
                    src="/images/avatar.jpg"
                    className="header-block-right-part-avatar"
                    alt="header-block-right-part-avatar"
                />
                <span className="header-block-right-part-name">
                    Стик Баг
                </span>
            </div>
        </header>
    );
}