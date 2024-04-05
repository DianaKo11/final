async function getActivity() {
    // Define the base URL for the API
    const baseUrl = 'https://localhost:7036/api/';

    // Construct the complete URL for fetching activity
    const url = baseUrl + "gpt/bored";

    // Define parameters for the fetch request
    const params = {
        method: 'GET', // Specify the HTTP method as GET
        headers: {
            Accept: 'application/json', // Specify the type of response expected
        },
    };

    // Send a fetch request to the specified URL with the defined parameters
    const response = await fetch(url, params);

    // Check if the response status is OK (200)
    if (response.ok) {
        // Parse the JSON response asynchronously
        const data = await response.json();

        // Extract the activity from the response data
        const activity = data["activity"];

        // Update the content of an element with id "act" with the retrieved activity
        document.getElementById("act").innerHTML = activity;
    } else {
        // Log an error message to the console if the response is not OK
        console.log("Error:", response.statusText);
    }
}
