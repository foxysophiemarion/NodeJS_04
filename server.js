const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const COUNTER_FILE = path.join(__dirname, 'counters.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Для парсинга JSON
app.use(express.json());

// Функция для чтения счетчиков из файла
function readCounters() {
	if (fs.existsSync(COUNTER_FILE)) {
		const data = fs.readFileSync(COUNTER_FILE);
		return JSON.parse(data);
	}
	return {};
}

// Функция для записи счетчиков в файл
function writeCounters(counters) {
	fs.writeFileSync(COUNTER_FILE, JSON.stringify(counters, null, 2));
}

// Функция для чтения пользователей из файла
function readUsers() {
	if (fs.existsSync(USERS_FILE)) {
		const data = fs.readFileSync(USERS_FILE);
		return JSON.parse(data);
	}
	return [];
}

// Функция для записи пользователей в файл
function writeUsers(users) {
	fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Инициализация счетчиков
let counters = readCounters();

// Обработчик для главной страницы
app.get('/', (req, res) => {
	const url = '/';
	counters[url] = (counters[url] || 0) + 1;
	writeCounters(counters);
	res.send(`
        <h1>Главная страница</h1>
        <p>Счетчик просмотров: ${counters[url]}</p>
        <button onclick="location.href='/about'">Перейти на страницу "О нас"</button>
    `);
});

// Обработчик для страницы "О нас"
app.get('/about', (req, res) => {
	const url = '/about';
	counters[url] = (counters[url] || 0) + 1;
	writeCounters(counters);
	res.send(`
        <h1>Страница "О нас"</h1>
        <p>Счетчик просмотров: ${counters[url]}</p>
        <button onclick="location.href='/'">Вернуться на главную страницу</button>
    `);
});

// Обработчик для получения всех пользователей
app.get('/users', (req, res) => {
	const users = readUsers();
	res.json(users);
});

// Обработчик для добавления нового пользователя
app.post('/users', (req, res) => {
	const newUser = req.body;
	const users = readUsers();
	users.push(newUser);
	writeUsers(users);
	res.json(newUser);
});

// Обработчик для обновления пользователя
app.put('/users/:id', (req, res) => {
	const userId = req.params.id;
	const updatedInfo = req.body;
	const users = readUsers();
	const userIndex = users.findIndex(user => user.id === userId);

	if (userIndex !== -1) {
		users[userIndex] = { ...users[userIndex], ...updatedInfo };
		writeUsers(users);
		res.json(users[userIndex]);
	} else {
		res.status(404).send('Пользователь не найден');
	}
});

// Обработчик для удаления пользователя
app.delete('/users/:id', (req, res) => {
	const userId = req.params.id;
	let users = readUsers();
	users = users.filter(user => user.id !== userId);
	writeUsers(users);
	res.sendStatus(204);
});

// Запуск сервера
app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`);
});