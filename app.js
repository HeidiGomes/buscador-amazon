// Importação de módulos necessários
const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Criação de uma aplicação Express
const app = express();

// Adiciona um cabeçalho CORS para permitir solicitações de qualquer origem
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Rota para lidar com solicitações de raspagem de produtos
app.get('/api/scrape', async (req, res) => {
  try {
    // Obtém a palavra-chave de pesquisa da consulta da solicitação
    const keyword = req.query.keyword;
    // Verifica se a palavra-chave foi fornecida
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    // Constrói a URL de pesquisa na Amazon com base na palavra-chave
    const url = `https://www.amazon.com.br/s?k=${keyword}`;
    // Realiza uma solicitação para obter o conteúdo da página de pesquisa
    const response = await axios.get(url);
    // Carrega o conteúdo HTML da página de resposta
    const $ = cheerio.load(response.data);
    // Array para armazenar os produtos extraídos
    const products = [];

    // Itera sobre os resultados da pesquisa e extrai os detalhes dos produtos
    $('div[data-component-type="s-search-result"]').each((index, element) => {
      const title = $(element).find('h2 > a').text().trim();
      const price = $(element).find('span[class="a-offscreen"]').first().text().trim();
      const rating = $(element).find('span[class="a-icon-alt"]').text().trim();
      const reviewCount = $(element).find('span[class="a-size-base"]').first().text().trim();
      const imageURL = $(element).find('img').attr('src');

      // Objeto representando um produto e seus detalhes
      const product = {
        title: title,
        price: price,
        rating: rating,
        reviewCount: reviewCount,
        imageURL: imageURL
      };
      // Adiciona o produto ao array de produtos
      products.push(product);
    });

    // Retorna os produtos extraídos como resposta JSON
    res.json(products);
  } catch (error) {
    // Em caso de erro, registra o erro e retorna uma resposta de erro
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Rota para servir o arquivo HTML estático
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicia o servidor na porta especificada
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
