export const getCities = async () => {
    const response = await fetch('http://localhost:8000/api/cities/');
    return response.json();
};

export const getBranches = async () => {
    const response = await fetch('http://localhost:8000/api/branches/');
    return response.json();
};

export const rankColleges = async (data) => {
    const response = await fetch('http://localhost:8000/api/rank_colleges/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};