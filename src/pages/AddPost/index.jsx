import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SimpleMDE from 'react-simplemde-editor';

import 'easymde/dist/easymde.min.css';
import styles from './AddPost.module.scss';
import {Link, Navigate, useNavigate, useParams} from "react-router-dom";
import {isAuthSelector} from "../../redux/slices/auth";
import {useSelector} from "react-redux";
import axios from '../../axios'


export const AddPost = () => {
    const {id} = useParams();
    const isAuth = useSelector(isAuthSelector)
    const navigate = useNavigate()
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const inputFileRef = useRef(null)

    const isEditing = Boolean(id)
    useEffect(() => {
        if (id) {
            axios.get(`/posts/${id}`).then(({data}) => {
                setTitle(data.title);
                setText(data.text);
                setTags(data.tags);
                setImageUrl(data.imageUrl);
            }).catch(err => {
                console.log(err)
            })
        }
    }, [])
    const handleChangeFile = async (event) => {
        try {
            const formData = new FormData();
            const file = event.target.files[0];
            formData.append('image', file);
            const {data} = await axios.post('/upload', formData);
            setImageUrl(data.url)
        } catch (error) {
            console.log(error)
        }
    };

    const onClickRemoveImage = async () => {
        setImageUrl('')
    };

    const onChange = useCallback((value) => {
        setText(value);
    }, []);

    const onSubmit = async () => {
        try {
            const fields = {
                title,
                imageUrl,
                tags,
                text

            }
            setLoading(true)

            const {data} = isEditing
                ? await axios.patch(`/posts/${id}`, fields)
                : await axios.post('/posts', fields)

            const _id = isEditing ? id : data._id;
            navigate(`/posts/${_id}`)
        } catch (error) {
            console.log(error)
        }
    }

    const options = useMemo(
        () => ({
            spellChecker: false,
            maxHeight: '400px',
            autofocus: true,
            placeholder: 'Введите текст...',
            status: false,
            autosave: {
                enabled: true,
                delay: 1000,
            },
        }),
        [],
    );

    if (window.localStorage.getItem('token') && !isAuth) {
        return <Navigate to='/'/>
    }

    return (
        <Paper style={{padding: 30}}>
            <Button onClick={() => inputFileRef.current.click()} variant="outlined" size="large">
                Загрузить превью
            </Button>
            <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden/>
            {imageUrl && (
                <>
                    <Button variant="contained" color="error" onClick={onClickRemoveImage}>
                        Удалить
                    </Button>
                    <img className={styles.image} src={`http://localhost:4444${imageUrl}`} alt="Uploaded"/>
                </>
            )}
            <br/>
            <br/>
            <TextField
                classes={{root: styles.title}}
                variant="standard"
                placeholder="Заголовок статьи..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
            />
            <TextField
                classes={{root: styles.tags}}
                variant="standard"
                placeholder="Тэги"
                value={tags}
                onChange={e => setTags(e.target.value)}
                fullWidth
            />
            <SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options}/>
            <div className={styles.buttons}>
                <Button onClick={onSubmit} size="large" variant="contained">
                    {isEditing ? 'Редактировать' : 'Опубликовать'}
                </Button>
                <Link to='/'>
                    <Button size="large">Отмена</Button>
                </Link>
            </div>
        </Paper>
    );
};
