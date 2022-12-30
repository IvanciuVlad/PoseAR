import type { Pose,  ResultsListener } from "@mediapipe/pose";
import { Component, createEffect, createSignal, Match, onMount, Show, Switch } from "solid-js";
import type { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/control_utils';
import type { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import styles from './canvas.module.css';
import Card from "../components/Card";
import RangeInput from "../components/RangeInput";
import Button from "../components/Button";

const points = {
    nose: 0,

    leftEyeInner: 1,
    leftEye: 2,
    leftEyeOuter: 3,

    rightEyeInner: 4,
    rightEye: 5,
    rightEyeOuter: 6,

    leftEar: 7,
    rightEar: 8,

    mouthLeft: 9,
    mouthRight: 10,

    leftShoulder: 11,
    rightShoulder: 12,

    leftElbow: 13,
    rightElbow: 14,

    leftWrist: 15,
    rightWrist: 16,

    leftPinky: 17,
    rightPinky: 18,

    leftIndex: 19,
    rightIndex: 20,

    leftThumb: 21,
    rightThumb: 22,

    leftHip: 23,
    rightHip: 24,

    leftKnee: 25,
    rightKnee: 26,

    leftAnkle: 27,
    rightAnkle: 28,

    leftHeel: 29,
    rightHeel: 30,

    leftFootIndex: 31,
    rightFootIndex: 32,

    referencePoint: 33,
    secondReferencePoint: 34,

    shoulderMidPoint: 35,
    earsMidPoint: 36,

    normalVertex: 37
}

const RUNNING_TIME = 60;
const INTERVAL_TIME = 20


const Canvas: Component = () => {

    const [ready, setReady] = createSignal(false);
    const [runningStatus, setRunningStatus] = createSignal(false)
    const [runningTime, setRunningTime] = createSignal(RUNNING_TIME)
    const [intervalTime, setIntervalTime] = createSignal(INTERVAL_TIME)
    const [currentRunningTime, setCurrentRunningTime] = createSignal(0)

    let camera: Camera;
    let pose: Pose;
    let interval: number | undefined;
    let forceStop = false;


    const init = () => {
        if (!ready()) {
            setReady(true);
        }
    }

    const startTimer = () => {
        clearInterval(interval)
        interval = setInterval(() => {
            if (forceStop === true) {
                clearInterval(interval)
                return;
            }
            setCurrentRunningTime(x => Math.round(x - 0.6))
        }, 600)
    }

    const startProgram = () => {
        forceStop = false
        camera?.start?.()
        setCurrentRunningTime(runningTime())
        setRunningStatus(true)
        startTimer()
    }

    const stopProgram = () => {
        camera?.stop?.()
        setCurrentRunningTime(intervalTime())
        setRunningStatus(false)
        startTimer()
    }

    const forceStopProgram = () => {
        clearInterval(interval)
        camera?.stop?.()
        setRunningStatus(false)
    }


    onMount(() => {

        const videoElement = document.getElementsByClassName('input_video')[0] as HTMLVideoElement;
        const canvasElement = document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement;
        const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
        const onResults: ResultsListener = (results) => {


            if (!results.poseLandmarks) {
                return;
            }
            init();


            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Only overwrite existing pixels.
            canvasCtx.globalCompositeOperation = 'source-in';
            canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

            // Only overwrite missing pixels.
            canvasCtx.globalCompositeOperation = 'destination-atop';
            canvasCtx.drawImage(
                results.image, 0, 0, canvasElement.width, canvasElement.height);

            canvasCtx.globalCompositeOperation = 'source-over';

            const modifiedConnections: [number, number][] = [
                [points.leftHip, points.rightHip],
                [points.rightHip, points.rightShoulder],
                [points.leftHip, points.leftShoulder],
                [points.leftShoulder, points.rightShoulder],
                [points.leftShoulder, points.leftEar], 

                [points.rightShoulder, points.rightEar],
                [points.leftEar, points.rightEar],
                [points.leftShoulder, points.shoulderMidPoint],
                [points.rightShoulder, points.shoulderMidPoint],

                [points.leftShoulder, points.leftElbow],
                [points.leftElbow, points.leftWrist],
                [points.leftWrist, points.leftPinky],
                [points.leftWrist, points.leftIndex],
                [points.leftWrist, points.leftThumb],
                [points.leftIndex, points.leftPinky],

                [points.rightShoulder, points.rightElbow],
                [points.rightElbow, points.rightWrist],
                [points.rightWrist, points.rightPinky],
                [points.rightWrist, points.rightIndex],
                [points.rightWrist, points.rightThumb],
                [points.rightIndex, points.rightPinky],

                [points.leftHip, points.leftKnee],
                [points.leftKnee, points.leftAnkle],
                [points.leftAnkle, points.leftHeel],
                [points.leftAnkle, points.leftFootIndex],
                [points.leftFootIndex, points.leftHeel],

                [points.rightHip, points.rightKnee],
                [points.rightKnee, points.rightAnkle],
                [points.rightAnkle, points.rightHeel],
                [points.rightAnkle, points.rightFootIndex],
                [points.rightFootIndex, points.rightHeel],
            ]

            const pointsToDraw = [
                results.poseLandmarks[points.leftShoulder], results.poseLandmarks[points.rightShoulder],
                results.poseLandmarks[points.leftEar], results.poseLandmarks[points.rightEar],
                results.poseLandmarks[points.leftElbow], results.poseLandmarks[points.rightElbow],
                results.poseLandmarks[points.leftWrist], results.poseLandmarks[points.rightWrist],
                results.poseLandmarks[points.leftHip], results.poseLandmarks[points.rightHip],
                results.poseLandmarks[points.leftKnee], results.poseLandmarks[points.rightKnee],
                results.poseLandmarks[points.leftAnkle], results.poseLandmarks[points.rightAnkle],
            ]


            // @ts-ignore
            drawConnectors(canvasCtx, results.poseLandmarks, modifiedConnections,
                { color: '#00FF00', lineWidth: 4 });
            // @ts-ignore
            drawLandmarks(canvasCtx, pointsToDraw,
                { color: '#FF0000', lineWidth: 2 });

            // @ts-ignore
            drawConnectors(canvasCtx, results.poseLandmarks, [points.shoulderMidPoint, points.normalVertex],
                { color: '#FFFF00', lineWidth: 2 });
            canvasCtx.restore();

        }

        setTimeout(() => {
            // @ts-ignore
            pose = new Pose({
                locateFile: (file: any) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });
            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            pose.onResults(onResults);

            // @ts-ignore
            camera = new Camera(videoElement, {
                onFrame: async () => {
                    await pose.send({ image: videoElement });
                },
                width: 1280,
                height: 720,

            });
        }, 1000);
    })

    createEffect(() => {
        if (currentRunningTime() < 0) {
            clearInterval(interval)
            if (runningStatus()) {
                stopProgram()
            } else {
                startProgram()
            }
        }
    })

    return <div class="flex justify-center">
        <div class="container sm:m-6 lg:mx-16 lg:my-4">
            <Show when={!ready()}>
                <p class="p-2 bg-red-600 text-xl">Make sure to allow the use of camera.</p>
            </Show>
            <div class="m-3">
                <h2 class="flex items-center text-4xl font-extrabold dark:text-white">
                    <span class="">
                        Based on MediaPipe Pose by Google
                    </span>
                </h2>
            </div >
            <div class="flex flex-col lg:flex-row">
                <div class="sm:w-full lg:max-w-3xl">
                    <Card>
                        <div class="mb-4 flex justify-center align-middle">
                            <canvas class="output_canvas" width="640px" height="360px"></canvas>
                        </div>

                        <div
                            class="border-2 p-4 rounded-xl bg-gray-100 dark:border-gray-200 dark:bg-gray-900"
                        >
                            <div class="flex row">
                                <Switch>
                                    <Match when={!runningStatus()}>
                                        <Button
                                            onClick={startProgram}
                                        >
                                            Start
                                        </Button>
                                    </Match>
                                    <Match when={runningStatus()}>
                                        <Button
                                            onClick={forceStopProgram}
                                            variant="error"
                                        >
                                            Stop
                                        </Button>
                                    </Match>
                                </Switch>
                            </div>

                            <RangeInput
                                label="Running Time (s)"
                                id="frame-running"
                                onChange={value => setRunningTime(value)}
                                value={runningTime()}
                                min={3}
                                max={180}
                                step={1}
                                help={`How many seconds to run the pose analyzer. E.g.: Run for ${runningTime()}s`}
                            />
                            <RangeInput
                                label="Pause Interval (s)"
                                id="frame-pause"
                                onChange={value => setIntervalTime(value)}
                                value={intervalTime()}
                                min={0}
                                max={600}
                                step={1}
                                help={`The length of interval between run sequences. E.g.: Run this after ${intervalTime()} seconds for ${runningTime()}s`}
                            />


                        </div>
                    </Card>
                </div>

            </div>
            <video class={`input_video ${styles.webcam}`}></video>
            <div class="landmark-grid-container"></div>
        </div>
    </div >
}

export default Canvas;