// import axios from 'axios';
 
//  const instance = axios.create({
//      baseURL: 'http://localhost:8000', // your server
//      withCredentials: true, // crucial for sending cookies
//  });
 
//  export default instance;


import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    // baseURL: 'http://localhost:8000',
    withCredentials: true,
});

export default instance;
