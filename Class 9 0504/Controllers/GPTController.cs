using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Prog3_WebApi_Javascript.DTOs;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Prog3_WebApi_Javascript.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GPTController : ControllerBase
    {
        private readonly HttpClient _client;

        // Constructor for GPTController
        public GPTController(IConfiguration config)
        {
            // Initialize HttpClient instance
            _client = new HttpClient();

            // Retrieve API key from configuration settings
            string api_key = config.GetValue<string>("OpenAI:Key");

            // Create authorization header using API key
            string auth = "Bearer " + api_key;

            // Add authorization header to HttpClient instance's default request headers
            _client.DefaultRequestHeaders.Add("Authorization", auth);
        }

        // Endpoint for GPT chat
        [HttpPost("GPTChat")]
        public async Task<IActionResult> GPTChat(Prompt promptFromUser)
        {
            // API endpoint for OpenAI GPT
            string endpoint = "https://api.openai.com/v1/chat/completions";
            // Specifies the model to use for chat completions (GPT-3.5 Turbo)
            string model = "gpt-3.5-turbo-0125";
            // Maximum number of tokens in the generated response
            int max_tokens = 300;
            double temperature = 1;

            // Construct prompt to send to the model
            string promptToSend = $"You are an expert in User Experience and Experience Design. You have created a quiz in this field. The quiz is made of multiple choise questions about one of three subjects the user will choose and in the language the user chooses. for example the subject of {promptFromUser.Subject}, in {promptFromUser.Language}" +
                                  $"Ensure the question is clear, concise, assesses various levels of understanding and designed to assess knowledge or understanding of the topic.Provide plausible distractors for the incorrect answers to make the questions challenging yet fair. Ensure that the correct answer is logical and accurate. Provide four answer options for each question, with one being the correct choice.";

            // Create GPTRequest object to send to the API
            GPTRequest request = new GPTRequest()
            {
                max_tokens = max_tokens,
                model = model,
                response_format = new { type = "json_object" },
                temperature = temperature,
                messages = new List<Message>() {
                    new Message
                    {
                        role = "user",
                        content = "You are an expert in User Experience and Experience Design. You have created a quiz in this field. You are creating multiple choice questions in various languages and levels. Whenever you receive a request, you must reply in the following JSON format: {'question': string, 'answers': [string, string, string, string], 'correct_answer_index': int, 'correct_answer':string}."
                    },
                    new Message
                    {
                        role = "user",
                        content = promptToSend
                    }
                }
            };

            // Send GPTRequest object to the OpenAI API
            var res = await _client.PostAsJsonAsync(endpoint, request);

            // Check if API response indicates an error
            if (!res.IsSuccessStatusCode)
                return BadRequest("problem: " + res.Content.ReadAsStringAsync());

            // Read JSON response from the API
            JsonObject? jsonFromGPT = res.Content.ReadFromJsonAsync<JsonObject>().Result;
            if (jsonFromGPT == null)
                return BadRequest("empty");

            // Extract generated content from JSON response
            string content = jsonFromGPT["choices"][0]["message"]["content"].ToString();

            // Return generated content
            return Ok(content);
        }

        // Endpoint to get random activity from Bored API
        [HttpGet("Bored")]
        public async Task<IActionResult> GetActivity()
        {
            // Define the endpoint for the Bored API
            string endpoint = "http://boredapi.com/api/activity/";

            // Send a GET request to the Bored API
            var response = await _client.GetAsync(endpoint);

            // Check if the response indicates success
            if (response.IsSuccessStatusCode)
            {
                // Read the JSON response content asynchronously
                JsonObject responseContent = response.Content.ReadFromJsonAsync<JsonObject>().Result;

                // Create a new Bored object to hold the activity
                Bored brd = new Bored();

                // Extract the activity from the response and assign it to the Bored object
                brd.activity = responseContent["activity"].ToString();

                // Return the activity as an OK response
                return Ok(brd);
            }

            // If the response indicates failure, return a BadRequest response with a message
            return BadRequest("API Call Failed");
        }

    }
}
