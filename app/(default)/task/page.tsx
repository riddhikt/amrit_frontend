'use client';

import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "@material-tailwind/react";
import { Stepper, Step, Button } from "@material-tailwind/react";
import { usePathname } from 'next/navigation';


  
  export default function task() {
    const [taskData, setTaskData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [points, setPoints] = useState(0);
    // const router = useRouter();
    const problem = usePathname();

    useEffect(() => {
        if (problem) {
            fetchTaskDetails(decodeURIComponent(problem));  // Decode the problem to get the original string
        }
    }, []);

    const fetchTaskDetails = async (problem: any) => {
        setIsLoading(true);
        // localhost = 'http://127.0.0.1:8000/send-prompt-to-gemini'
        try {
            const response = await fetch('https://task-agent-f5be9ac4a649.herokuapp.com/task-generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: problem })
            });
            const data = await response.json();
            setTaskData(data);
        } catch (error) {
            console.error('Failed to fetch task details:', error);
        } finally {
            setIsLoading(false);
            console.log(taskData);
        }
    };

    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            convertToBase64(file); // Convert the image to Base64
        }
    };

    const convertToBase64 = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImageBase64(reader.result); // Set the base64 string to state
        };
        reader.onerror = (error) => {
            console.error('Error converting image to Base64:', error);
        };
    };

    const handleSubmit = async () => {
        if (!imageBase64 || !taskData.tasks[activeStep].task) {
            console.error('Required data is missing!');
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                image_base64: imageBase64,
                task: activeStep == 0 ? 'Drink water' : taskData.tasks[activeStep].task,
            };
            console.log(payload);
            const response = await fetch('https://vision-agent-b28f010409b5.herokuapp.com/describe-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json();
            console.log('Submission successful:', responseData);
            setIsLoading(false);
            if (responseData.result == 'true'){
                setActiveStep(activeStep+1);
                setPoints(points + 20);
            } else {
                alert('Error upload another image')
            }
            setImagePreview(null);
        } catch (error) {
            console.error('Failed to submit task:', error);
            setIsLoading(false);
        }
    };

    // const [imagePreview, setImagePreview] = useState(null);
    // const initialState = {
    //     Image_base64: null,
    //     task: "",
    // };
    // const [formData, setFormData] = useState(initialState);

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //       // Generate a URL for the image preview
    //       setImagePreview(URL.createObjectURL(file));
    //       // Set the file object to formData
    //       setFormData((prevFormData) => ({
    //         ...prevFormData,
    //         Image_base64: file, // Store the file object
    //       }));
    //     }
    // };

    const [activeStep, setActiveStep] = useState(0);
    const [isLastStep, setIsLastStep] = useState(false);
    const [isFirstStep, setIsFirstStep] = useState(false);

    

    // const handleSubmitButton = async () => {
    //     const convertToBase64 = (file) =>
    //         new Promise((resolve, reject) => {
    //             const reader = new FileReader();
    //             reader.readAsDataURL(file);
    //             reader.onload = () => resolve(reader.result);
    //             reader.onerror = (error) => reject(error);
    //     });

    //     // Attempt to convert image to Base64 (if exists)
    //     const imageBase64 = Image_base64
    //     ? await convertToBase64(formData.Image_base64)
    //     : null;
    // }
    
    return (
        <div className="mx-auto max-w-4xl p-8 my-20">
            {isLoading ? (
            <div className="flex justify-center align-center">
                <h2 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">Our AI is planning out the best tasks for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">You.</span><Spinner className="h-12 w-12" /></h2>
                <div>
                {/* <Spinner className="h-12 w-12" /> */}
                </div>
            </div>
            ) : taskData ? (
                <div>
                    <div className="m-10">
                        {console.log(taskData.tasks)}
                    <h2 className="h4 my-4">Points - {points}</h2>
                    <Stepper
                        activeStep={activeStep}
                        isLastStep={(value) => setIsLastStep(value)}
                        isFirstStep={(value) => setIsFirstStep(value)}
                    >
                    <Step>1</Step>
                    <Step>2</Step>
                    <Step>3</Step>
                    <Step>4</Step>
                    <Step>5</Step>
                </Stepper>
            </div>
            <div className="m-10">
                <h2 className="h4 my-4">Task {activeStep+1} - {activeStep == 0 ? 'Drink some water' : taskData.tasks[activeStep].task}</h2>
            </div>
            <div className="col-span-full m-10">
                <label className="block text-m font-medium leading-6 text-gray-900 text-left">
                    {activeStep == 0 ? 'Upload a picture of you drinking water' : taskData.tasks[activeStep].expected_photo}
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        {imagePreview ? (
                        <>
                            <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-xs h-auto"
                            />
                            <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="text-sm relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                            Change Image
                            </button>
                        </>
                        ) : (
                        <>
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                                    <span>Upload an Image</span>
                                    <input
                                        id="imageInfo"
                                        name="imageInfo"
                                        type="file"
                                        accept="image/png, image/jpeg, image/gif" // Specify accepted file formats
                                        className="sr-only"
                                        capture // This attribute is used to tell the browser to use camera for capturing an image
                                        required
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                        </>
                        )}

                        <p className="text-xs leading-5 text-gray-600">
                        PNG, JPG, GIF up to 10MB
                        </p>
                    </div>
                </div>
            </div>
                <div className="m-10">
                    {/* Put response here */}
                    {activeStep == 0 ? "Drinking water provides a physical distraction from the act of smoking. The act of drinking water mimics some of the hand-to-mouth actions of smoking, which can psychologically satisfy the craving." : taskData.tasks[activeStep].description}
                </div>
                <div className="m-10">
                    <Button onClick={handleSubmit} size="lg">{"Submit"}</Button>
                </div>
            </div>
            ) : (
                <p>No task details available. Please go back and select a problem.</p>
            )}
        </div>
    )
  }
  