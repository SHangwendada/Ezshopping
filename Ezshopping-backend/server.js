const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;
const flag = process.env.GZCTF_FLAG
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: '103.8.69.140',  // 数据库地址
    user: 'root',          // 数据库用户名
    password: 'huhstsec123.', // 数据库密码
    database: 'addatabase',  // 数据库名
    port: 3307              // 指定端口号
});


// Login API
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // 更新查询语句以检查用户是否被封禁
    const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND is_banned = FALSE';

    pool.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            res.send('Login successful');
        } else {
            // 由于查询中包含了is_banned的检查，因此任何找不到的情况都会返回登录失败，
            // 这包括了账号不存在、密码错误或用户被封禁的情况。
            res.status(401).send('登陆失败，密码错误或者账号被封禁');
        }
    });
});



// Get money API
app.post('/money', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send('Username is required');
    }

    const query = 'SELECT money FROM users WHERE username = ?';
    pool.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            const money = results[0].money;
            res.json({ money: money });
        } else {
            res.status(404).send('User not found');
        }
    });
});


// Register API
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // First check if the username already exists
    pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            return res.status(409).send('Username already exists');
        } else {
            // If not, proceed to insert new user
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            pool.query(query, [username, password], (insertErr, insertResults) => {
                if (insertErr) {
                    console.error('Database error:', insertErr);
                    return res.status(500).send('Server error');
                }
                res.send('User registered successfully');
            });
        }
    });
});




// Purchase API
app.post('/purchase', (req, res) => {
    const { username, Money, signature } = req.body;
    if (!username || Money === undefined || !signature) {
        return res.status(400).send('Username, money, and signature are required');
    }

    const expectedSignature = "376c4fe518240bc513f67bf477d5d950d757d51bb58db594fa4551e248364413";
    if (signature !== expectedSignature) {
        return res.status(403).send('Invalid signature');
    }

    // Query to select the user's current money balance and request count
    const query = 'SELECT money, request_count, is_banned FROM users WHERE username = ?';
    pool.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error: ' + err.message);
        }

        if (results.length > 0) {
            const { money, request_count, is_banned } = results[0];

            // Check if the user is already banned
            if (is_banned) {
                return res.send('User is banned');
            }

            // Increment the request count and check if it exceeds the limit
            const newRequestCount = request_count + 1;
            const banUser = newRequestCount > 500;

            const updateQuery = `UPDATE users SET request_count = ?${banUser ? ', is_banned = TRUE' : ''} WHERE username = ?`;

            // Update request count and possibly ban the user
            pool.query(updateQuery, [newRequestCount, username], (updateErr) => {
                if (updateErr) {
                    console.error('Database error on update:', updateErr);
                    return res.status(500).send('Server error while updating user: ' + updateErr.message);
                }

                if (banUser) {
                    return res.status(403).send('Request limit exceeded, user has been banned');
                }

                // Continue with the purchase process
                const priceOfItem = 114514; // Since you're checking against a specific Money value
                const moneyAsNumber = parseFloat(Money);
                const newMoney = money - priceOfItem;

                if (moneyAsNumber === priceOfItem) {
                    res.send(flag);
                    const updateMoneyQuery = 'UPDATE users SET money = ? WHERE username = ?';
                    pool.query(updateMoneyQuery, [newMoney, username], (moneyUpdateErr) => {
                        if (moneyUpdateErr) {
                            console.error('Database error on money update:', moneyUpdateErr);
                            return res.status(500).send('Server error while updating money: ' + moneyUpdateErr.message);
                        }
                    });
                } else if (Money < priceOfItem) {
                    res.send('Not enough money!!');
                } else {
                    res.send('Did you cheat with this much money?!');
                }
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});






// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
