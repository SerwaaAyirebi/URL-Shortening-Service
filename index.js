const express = require('express');
const mysql = require('mysql2');
const app = express();

// DATABASE CONNECTION 
const connection = mysql.createConnection({
    host: 'localhost',
    database: 'url_shortener',
    user: 'root',
    password: '1234'
});

connection.connect(function(error) {
    if (error) {
        console.error('Database connection failed:', error);
        throw error;
    } else {
        console.log('Database connected successfully!');
    }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the URL Shortening Service!');
});

const PORT = 54699;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

// POST endpoint to shorten a URL
app.post('/shorten', (req, res) => {
    const originalUrl = req.body.url;
    if (!originalUrl) {
        return res.status(400).json({error: 'URL is required'});
    }

    // Here generate a short code and store the mapping in a database
    const shortCode = Date.now().toString(36);
  
    const query = 'INSERT INTO urls (original_url, short_code, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
    connection.query(query, [originalUrl, shortCode], (error, results) => {
        if (error) {
            console.error('Error inserting URL into database:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
          const shortUrl = {
        "message": "URL shortened successfully",
        "originalUrl": originalUrl,
        "shortCode": shortCode,  
        "shortUrl": `${baseUrl}/${shortCode}`,
        "createdAt": new Date(),
        "updatedAt": new Date()
    };
     res.json(shortUrl); 
    })   

});

// GET endpoint to retrieve original URL from short code
// app.get('/:shortCode', (req, res) => {
//     const shortCode = req.params.shortCode;
    
//     const query = 'SELECT original_url FROM urls WHERE short_code = ?';
//     connection.query(query, [shortCode], (error, results) => {
//         if (error) {
//             console.error('Error fetching URL from database:', error);
//             return res.status(500).json({error: 'Internal Server Error'});
//         }
//         if (results.length === 0) {
//             return res.status(404).json({error: 'Short URL not found'});
//         }
        // res.json({originalUrl: results[0].original_url});
//         res.redirect(results[0].original_url);
//     })

// });

app.get('/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;

    const query = 'SELECT original_url FROM urls WHERE short_code = ?';
    connection.query(query, [shortCode], (error, results) => {
        console.log('DB results:', results);

        if (error) {
            console.error('Error fetching URL from database:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }

        if (results.length === 0) {
            return res.status(404).json({error: 'Short URL not found'});
        }

        let url = results[0].original_url;

        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        res.redirect(url);
    });
});

// UPDATE endpoint to edit the original URL from short code
app.put('/shorten/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const newOrginalUrl = req.body.url;

    const query = 'UPDATE urls SET original_url = ?, updated_at = NOW() WHERE short_code = ?';
    connection.query(query, [newOrginalUrl, shortCode], (error, results) => {
        if (error) {
            console.error('Error updating URL in database:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({error: 'Short URL not found'});
        }
          const shortUrl = {
        "message": 'URL updated successfully',
        "originalUrl": newOrginalUrl,
        "shortCode": shortCode,  
        "createdAt": new Date(),
        "updatedAt": new Date()
    };
     res.json(shortUrl); 
    })
});

// delete endpoint to delete a URL from short code 
app.delete('/shorten/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;

    const query = 'DELETE FROM urls WHERE short_code = ?';
    connection.query(query, [shortCode], (error, results) => {
        if (error) {
            console.error('Error fetching URL from database:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({error: 'Short URL not found'});
        }
        res.json({
            message: "URL Successfully deleted",
            shortCode: shortCode,
            affectedRows: results.affectedRows
        });
    })
});

app.get('/shorten/:shortCode/stats', (req, res) => {
    const shortCode = req.params.shortCode;

    const query = 'SELECT original_url, short_code, clicks, created_at, updated_at FROM urls WHERE short_code = ?';
    connection.query(query, [shortCode], (error, results) => {
        if (error) {
            console.error('Error fetching URL stats from database:', error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        
        if (results.length === 0) {
            return res.status(404).json({error: 'Short URL not found'});
        }

        const updateQuery = 'UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?';
        connection.query(updateQuery, [shortCode]);
        
        let url = results[0].original_url;
        if (!url.startsWith('https')) {
            url = 'https://' + url;
        }
        
        res.redirect(url);
    });
});