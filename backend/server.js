const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'warehouse'
});
// Удаление заказов с истекшей датой при запуске сервера
const deleteExpiredOrders = async () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const deleteSql = `DELETE FROM orders WHERE order_date < ?`;
    await db.promise().query(deleteSql, [currentDate]);
    console.log('Заказы с истекшей датой удалены.');
};

db.connect(async (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключение к базе данных успешно!');
    await deleteExpiredOrders(); // Удаляем заказы с истекшей датой
});

// Маршрут для проверки работы сервера
app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Получение всех заказов
app.get('/orders', (req, res) => {
    const sql = `
        SELECT
            o.order_id,
            o.customer_name,
            o.order_date,
            oi.item_id,
            oi.product_id,
            oi.quantity,
            p.product_name
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        ORDER BY o.order_date DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка при получении данных', details: err });
        }

        const orders = {};

        results.forEach(row => {
            const { order_id, customer_name, order_date, item_id, product_id, quantity, product_name } = row;

            if (!orders[order_id]) {
                orders[order_id] = {
                    order_id,
                    customer_name,
                    order_date,
                    items: []
                };
            }

            if (item_id) {
                orders[order_id].items.push({
                    item_id,
                    product_id,
                    product_name,
                    quantity
                });
            }
        });

        const response = Object.values(orders);
        res.json(response);
    });
});

app.post('/orders/add', async (req, res) => {
    const { customer_name, order_date, items } = req.body;

    try {
        // Проверка наличия товаров на складе
        for (const item of items) {
            const checkStockSql = `SELECT quantity FROM products WHERE product_id = ?`;
            const [product] = await db.promise().query(checkStockSql, [item.product_id]);

            if (product.length === 0) {
                return res.status(400).json({ error: `Товар с ID ${item.product_id} не найден` });
            }

            if (product[0].quantity < item.quantity) {
                return res.status(400).json({ error: `Недостаточно товара с ID ${item.product_id} на складе` });
            }
        }

        // Добавление заказа
        const insertOrderSql = `INSERT INTO orders (customer_name, order_date) VALUES (?, ?)`;
        const [orderResult] = await db.promise().query(insertOrderSql, [customer_name, order_date]);

        const orderId = orderResult.insertId;

        // Добавление позиций заказа и обновление количества товаров
        for (const item of items) {
            const insertItemSql = `INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`;
            await db.promise().query(insertItemSql, [orderId, item.product_id, item.quantity]);

            const updateStockSql = `UPDATE products SET quantity = quantity - ? WHERE product_id = ?`;
            await db.promise().query(updateStockSql, [item.quantity, item.product_id]);
        }

        res.status(201).json({ message: 'Заказ успешно добавлен', order_id: orderId });
    } catch (error) {
        console.error('Ошибка при добавлении заказа:', error);
        res.status(500).json({ error: 'Ошибка при добавлении заказа', details: error.message });
    }
});

// Удаление заказа
app.delete('/orders/delete/:order_id', (req, res) => {
    const { order_id } = req.params;

    const sql = `
        DELETE FROM orders
        WHERE order_id = ?;
    `;

    db.query(sql, [order_id], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении заказа:', err);
            return res.status(500).json({ error: 'Ошибка при удалении заказа', details: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        res.json({ message: 'Заказ успешно удалён' });
    });
});

// Получение списка товаров
app.get('/products', (req, res) => {
    const sql = `SELECT * FROM products;`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка при выполнении запроса:', err);
            return res.status(500).json({ error: 'Ошибка при получении данных', details: err });
        }

        res.json(results);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

app.post('/orders/add', (req, res) => {
    const { customer_name, order_date, items } = req.body;

    const sql = `
        INSERT INTO orders (customer_name, order_date)
        VALUES (?, ?);
    `;

    db.query(sql, [customer_name, order_date], (err, result) => {
        if (err) {
            console.error('Ошибка при добавлении заказа:', err);
            return res.status(500).json({ error: 'Ошибка при добавлении заказа', details: err });
        }

        const orderId = result.insertId;

        items.forEach(item => {
            const insertItemSql = `
                INSERT INTO order_items (order_id, product_id, quantity)
                VALUES (?, ?, ?);
            `;

            db.query(insertItemSql, [orderId, item.product_id, item.quantity], (err, result) => {
                if (err) {
                    console.error('Ошибка при добавлении позиции заказа:', err);
                    return res.status(500).json({ error: 'Ошибка при добавлении позиции заказа', details: err });
                }
            });
        });

        res.status(201).json({ message: 'Заказ успешно добавлен', order_id: orderId });
    });
});
app.put('/orders/edit', async (req, res) => {
    const { order_id, customer_name, order_date, items } = req.body;

    try {
        // Получаем текущие позиции заказа
        const getItemsSql = `SELECT * FROM order_items WHERE order_id = ?`;
        const [currentItems] = await db.promise().query(getItemsSql, [order_id]);

        // Создаем объект для хранения текущих позиций
        const currentItemsMap = new Map(currentItems.map(item => [item.product_id, item.quantity]));

        // Проверяем наличие товаров на складе только для новых или измененных позиций
        for (const item of items) {
            const productId = item.product_id;
            const newQuantity = item.quantity;
            const oldQuantity = currentItemsMap.get(productId) || 0;

            // Если количество изменилось, проверяем наличие на складе
            if (newQuantity !== oldQuantity) {
                const checkStockSql = `SELECT quantity FROM products WHERE product_id = ?`;
                const [product] = await db.promise().query(checkStockSql, [productId]);

                if (product.length === 0) {
                    return res.status(400).json({ error: `Товар с ID ${productId} не найден` });
                }

                const availableQuantity = product[0].quantity + oldQuantity; // Учитываем возвращенные товары
                if (availableQuantity < newQuantity) {
                    return res.status(400).json({ error: `Недостаточно товара с ID ${productId} на складе` });
                }
            }
        }

        // Обновляем заказ
        const updateOrderSql = `UPDATE orders SET customer_name = ?, order_date = ? WHERE order_id = ?`;
        await db.promise().query(updateOrderSql, [customer_name, order_date, order_id]);

        // Удаляем только те позиции, которые больше не нужны
        const deleteItemsSql = `DELETE FROM order_items WHERE order_id = ? AND product_id NOT IN (?)`;
        const productIdsToKeep = items.map(item => item.product_id);
        await db.promise().query(deleteItemsSql, [order_id, productIdsToKeep]);

        // Обновляем или добавляем новые позиции
        for (const item of items) {
            const productId = item.product_id;
            const newQuantity = item.quantity;
            const oldQuantity = currentItemsMap.get(productId) || 0;

            if (newQuantity !== oldQuantity) {
                // Обновляем количество товаров на складе
                const updateStockSql = `UPDATE products SET quantity = quantity + ? - ? WHERE product_id = ?`;
                await db.promise().query(updateStockSql, [oldQuantity, newQuantity, productId]);

                // Обновляем или добавляем позицию в заказе
                const upsertItemSql = `
                    INSERT INTO order_items (order_id, product_id, quantity)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity = ?;
                `;
                await db.promise().query(upsertItemSql, [order_id, productId, newQuantity, newQuantity]);
            }
        }

        res.status(200).json({ message: 'Заказ успешно изменен' });
    } catch (error) {
        console.error('Ошибка при изменении заказа:', error);
        res.status(500).json({ error: 'Ошибка при изменении заказа', details: error.message });
    }
});
// Эндпоинт для переключения даты
app.post('/date/next-day', async (req, res) => {
    try {
        // Получаем текущую дату
        const currentDate = new Date().toISOString().split('T')[0];

        // Находим все заказы на текущую дату
        const getOrdersSql = `SELECT * FROM orders WHERE order_date = ?`;
        const [orders] = await db.promise().query(getOrdersSql, [currentDate]);

        // Удаляем заказы на текущую дату и обновляем остатки товаров
        for (const order of orders) {
            // Получаем позиции заказа
            const getItemsSql = `SELECT * FROM order_items WHERE order_id = ?`;
            const [items] = await db.promise().query(getItemsSql, [order.order_id]);

            // Удаляем заказ
            const deleteOrderSql = `DELETE FROM orders WHERE order_id = ?`;
            await db.promise().query(deleteOrderSql, [order.order_id]);

            // Удаляем позиции заказа
            const deleteItemsSql = `DELETE FROM order_items WHERE order_id = ?`;
            await db.promise().query(deleteItemsSql, [order.order_id]);
        }

        // Увеличиваем остатки товаров на случайные величины
        const getProductsSql = `SELECT * FROM products`;
        const [products] = await db.promise().query(getProductsSql);

        for (const product of products) {
            const randomQuantity = Math.floor(Math.random() * 10) + 1; // Случайное число от 1 до 10
            const updateStockSql = `UPDATE products SET quantity = quantity + ? WHERE product_id = ?`;
            await db.promise().query(updateStockSql, [randomQuantity, product.product_id]);
        }

        res.status(200).json({ message: 'Дата успешно переключена, заказы отгружены, остатки обновлены' });
    } catch (error) {
        console.error('Ошибка при переключении даты:', error);
        res.status(500).json({ error: 'Ошибка при переключении даты', details: error.message });
    }
});