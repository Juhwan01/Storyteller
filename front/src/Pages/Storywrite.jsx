import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Storywrite = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>스토리 작성</h1>
            <form>
                <input type="text" placeholder="제목" />
                <textarea placeholder="내용" />
                <button type="submit">작성</button>
            </form>
        </div>
    );
}

export default Storywrite;