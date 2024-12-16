# Visual Vocabulary Builder - MVP 

## 1. Introduction

This document outlines the scope and specifications for the Minimum Viable Product (MVP) of the "Visual Vocabulary Builder" web application, focusing on validating the core concept of image-based vocabulary learning, with object detection (Gemini API) and visual annotation. Text-to-speech audio functionality is excluded from this MVP.

## 2. Core Concept

The application allows users to upload images, automatically detect and annotate objects using the Gemini API. Users can edit the detected annotations, modify the text, style, and also manually add/delete annotation boxes. All data, including images, is persisted, associated with a default user. Text-to-speech audio is not part of the application in this MVP.

## 3. MVP Goals

*   Validate the core concept of image-based vocabulary learning through visual annotations.
*   Provide a functional user interface for image upload, object detection, and annotation editing.
*   Integrate real Gemini API for object detection.
*   Implement a basic database schema for persistence.
*   Simulate a default public user.
*   Keep the scope minimal, enabling rapid development and iteration (excluding full user auth and audio features).
*   Collect user feedback to inform future development.

## 4. Core Features

### 4.1 Image Upload

*   Users can upload an image from their local device.
*   The image URL will be sent to a function for processing.

### 4.2 Gemini API Object Detection

*   When an image is uploaded, a function will call the Gemini API to detect objects.
*   The Gemini API will return object labels and their bounding box coordinates.

### 4.3 Annotation Display and Editing

*   Detected objects will be displayed on the image with bounding boxes.
*   Users can:
    *   Edit annotation text.
    *   Change the language of the annotation (English, Chinese, or Both).
    *   Modify bounding box positions and sizes.
    *   Adjust style of the annotation text (font size, color).
    *   Add or remove annotations manually.

### 4.5 Data Persistence

*   All uploaded images, object detection results, annotation data, and bounding box data will be saved, associated with the default user.
*   Data will be persisted across sessions for this default user.

### 4.6 Simulated Default User

*   A default public user will be simulated in code, using a pre-defined UUID as a `user_id`.
*   No user login or profile management screen is provided.

## 5. Technical Implementation

### 5.1 Front-End

*   **Framework:** React
*   **State Management:** Zustand
*   **UI Library:** tailwind
*   **Image Upload:** HTML file input element. The image will be uploaded explicitly.
*   **Gemini API Integration:** Use the Gemini API client library for all communication with Gemini API services.

### 5.3 Data Flow

1.  **Simulated User**: Use a UUID for a default public user.
2.  User uploads an image via the front-end, obtaining the URL.
3.  Front-end triggers a function with the image URL.
4.  The function:
    *   Calls the Gemini API for object detection, creating the annotation data.
    *   Saves the image metadata, annotation, bounding box data, associated with the simulated default user.
    *   Returns the processed data (detection results, the image URL, and annotation data).
5.  Front-end displays the image, annotations, and bounding boxes.
6.  User can further edit the annotations.

## 6. Out of Scope

The following features are explicitly excluded from this MVP:

*   Full user authentication/login.

## 7. User Stories

*   As a user, I can upload an image to learn vocabulary.
*   As a user, I can see detected objects in the image and edit the bounding boxes.
*   As a user, I can easily modify and annotate the detected objects.
*   As a user, I expect all changes to be saved, even if I return.
 *   As a user, API calls will have a visual loading indicator.

## 8. Success Metrics

*   Successful implementation of the database schema.
*   Successful integration of Gemini API.
*   Successful data association with a simulated default user.
* Image upload, object detection loading time is under 2 seconds.

## 9. Future Considerations

*   Implement full user authentication.
*   Allow users to manage their own profiles.
*   More annotation styles and options.
*   User-defined categories and vocabulary lists.
*   Integration of spaced repetition features.
*    Mobile compatibility.
*  Add Audio back.
    * Full multi-language support.
