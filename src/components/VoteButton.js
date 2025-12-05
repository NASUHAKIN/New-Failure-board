import React from 'react';

const VoteButton = ({ failureId, onVote, votes }) => {
    return (
        <button onClick={() => onVote(failureId)} className="vote-btn">
            ❤️ {votes}
        </button>
    );
};

export default VoteButton;