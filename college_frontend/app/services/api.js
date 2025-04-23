export const getCities = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const response = await fetch('https://collegechayan.com/cities/', {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else {
            console.error('Error fetching cities:', error);
        }
        return [];
    }
};

export const getBranches = async (institutionTypes) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const queryParams = institutionTypes.map(type => `institution_types=${encodeURIComponent(type)}`).join('&');
        const response = await fetch('https://collegechayan.com/branches/?${queryParams}', {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else {
            console.error('Error fetching branches:', error);
        }
        return [];
    }
};

export const rankColleges = async (data) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for ranking

    try {
        const response = await fetch('https://collegechayan.com/rank_colleges/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log('Response from backend:', jsonData);
        return jsonData;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else {
            console.error('Error in rankColleges:', error);
        }
        throw error;
    }
};

// Fetch states from the backend (unique states from nit_combined.xlsx)
export const getStates = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const response = await fetch('https://collegechayan.com/states/', {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out');
        } else {
            console.error('Error fetching states:', error);
        }
        return [];
    }
};