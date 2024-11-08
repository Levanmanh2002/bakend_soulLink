const express = require('express');
const router = express.Router();
const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const xml2js = require('xml2js');

const defaultThumbnail = 'https://via.placeholder.com/150x100?text=No+image';

router.get('/stories', async (req, res) => {
  const { limit } = req.query;

  try {
    const url = 'https://vnexpress.net/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const news = [];

    $('article.item-news').each((i, el) => {
      const title = $(el).find('h3.title-news a').text();
      const link = $(el).find('h3.title-news a').attr('href');
      const thumbnail = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || defaultThumbnail;

      news.push({ title, link, thumbnail });
    });

    // Trả về số lượng bài viết tương ứng với tham số truy vấn (nếu có)
    const result = limit ? news.slice(0, limit) : news;
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

module.exports = router;
