const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/');
        const data = await res.json();
        console.log('Health Check:', data);
    } catch (err) {
        console.error('Health Check Failed:', err.message);
    }
};

test();
