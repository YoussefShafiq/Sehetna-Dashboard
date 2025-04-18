import React, { useContext, useEffect, useState } from 'react'
import image from '../assets/images/Secure login-amico.svg'
import logo from '../assets/images/Sehetna 1.png'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { Formik, useFormik } from 'formik'
import axios from 'axios'
import { object, string } from 'yup'
// import toast from 'react-hot-toast'
import { ThreeDots } from 'react-loader-spinner'
import toast from 'react-hot-toast';


export default function Login() {
    const [error, setError] = useState('')
    const [loading, setloading] = useState(false)
    let navigate = useNavigate()

    async function login(values) {
        setloading(true)
        try {
            setError('')
            let { data } = await axios.post('https://api.sehtnaa.com/api/auth/login', values)
            setloading(false)
            toast.success('logged in successfully', {
                duration: 2000,
            })
            localStorage.setItem('username', data.data.user.first_name)
            localStorage.setItem('userToken', data.data.token)
            localStorage.setItem('role', data.data.user.admin.role)
            navigate('/')

        } catch (error) {
            toast.error(error.response.data.message, {
                duration: 5000,
            })
            setloading(false)
            setError(error.response.data.message)
        }
    }

    let validationSchema = object({
        email: string().email('invalid mail').required('email is required'),
        password: string().min(3, 'password must be at least 3 length').required('password is required')
    })

    let formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            user_type: 'admin'
        }, validationSchema, onSubmit: login
    })

    const params = new URLSearchParams(location.search);
    const paramToken = params.get('token');




    return <>
        <div className="h-screen bg-base dark:bg-dark overflow-hidden relative transition-colors duration-300">

            <div className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-[90%] w-[90%] bg-[#ffffffc0] dark:bg-dark1 dark:bg-opacity-20 transition-colors duration-300 dark:text-white backdrop-blur-md rounded-lg shadow-xl " >
                <div className="container m-auto flex lg:flex-row flex-col items-center lg:items-stretch h-full" >
                    <div className="hidden lg:flex w-2/3 lg:w-1/2 h-full  justify-center items-center ">
                        <img src={image} className='w-5/6' alt="illustration for sand clock and man working on laptop" />
                    </div>

                    <div className="h-full w-full p-5 lg:p-0 lg:w-1/2 flex flex-col items-center justify-center overflow-y-scroll" style={{ scrollbarWidth: 'none' }}>
                        <div className='w-1/4 lg:w-2/6 pt-10' ><img src={logo} className='w-full max-w-full object-contain' alt="sehetna" /></div>
                        <h1 className='text-5xl font-bold text-center text-black' >Welcome Back!</h1>
                        <h2 className='text-primary text-sm' >Login for your dashboard.</h2>
                        <form onSubmit={formik.handleSubmit} className="w-full max-w-sm my-5">
                            <div className="relative z-0 w-full group mb-4">
                                <input type="email" name="email" id="email" onBlur={formik.handleBlur} onChange={formik.handleChange} className="block py-2.5 px-0 w-full text-sm text-primary bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-sky-500 focus:outline-none focus:ring-0 focus:border-darkTeal peer" placeholder=" " />
                                <label htmlFor="email" className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-darkTeal peer-focus:dark:text-darkTeal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
                                {formik.errors.email && formik.touched.email &&
                                    <div className=" text-sm text-red-800 rounded-lg bg-transparent dark:text-red-600 " role="alert">
                                        {formik.errors.email}
                                    </div>
                                }
                            </div>
                            <div className="relative z-0 w-full group">
                                <input type="password" name="password" id="password" onBlur={formik.handleBlur} onChange={formik.handleChange} className="block py-2.5 px-0 w-full text-sm text-primary bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-sky-500 focus:outline-none focus:ring-0 focus:border-darkTeal peer" placeholder=" " />
                                <label htmlFor="password" className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-darkTeal peer-focus:dark:text-darkTeal peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
                                {formik.errors.password && formik.touched.password &&
                                    <div className=" text-sm text-red-800 rounded-lg bg-transparent dark:text-red-600" role="alert">
                                        {formik.errors.password}
                                    </div>
                                }
                            </div>
                            <div className='text-darkTeal text-end mt-2 mb-5' ><Link to={'/forgetpassword'}>forget password?</Link></div>
                            <button
                                type="submit"
                                disabled={loading}
                                className='w-full h-12 rounded-xl bg-gradient-to-r from-primary via-primary to-[#0f303e] text-white text-xl font-bold hover:shadow-md'
                                style={{ transition: 'background-position 0.4s ease', backgroundSize: '150%' }}
                                onMouseEnter={(e) => e.target.style.backgroundPosition = 'right'}
                                onMouseLeave={(e) => e.target.style.backgroundPosition = 'left'}
                            >
                                {loading ? (
                                    <ThreeDots
                                        visible={true}
                                        height="20"
                                        width="43"
                                        color="white"
                                        radius="9"
                                        ariaLabel="three-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass="w-fit m-auto"
                                    />
                                ) : "login"}
                            </button>
                        </form>



                    </div>
                </div>
            </div>




        </div>
    </>
}
