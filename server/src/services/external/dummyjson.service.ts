import axios from "axios";

const dummyJsonApi = axios.create({
    baseURL: "https://dummyjson.com",
    timeout: 5000,
});

export default dummyJsonApi;