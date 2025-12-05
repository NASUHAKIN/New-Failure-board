export const submitFailure = async (failureData) => {
    try {
        const response = await fetch('/api/failures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(failureData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error submitting failure:', error);
        throw error;
    }
};

export const fetchFailures = async () => {
    try {
        const response = await fetch('/api/failures');
        return await response.json();
    } catch (error) {
        console.error('Error fetching failures:', error);
        throw error;
    }
};

export const voteOnFailure = async (failureId) => {
    try {
        const response = await fetch(`/api/failures/${failureId}/vote`, {
            method: 'POST',
        });
        return await response.json();
    } catch (error) {
        console.error('Error voting on failure:', error);
        throw error;
    }
};