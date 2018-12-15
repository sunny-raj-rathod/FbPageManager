using System;
using System.Net.Http;

namespace FbPageManager.Utilities
{
    public static class HttpUtility
    {
        private static string GetUrl(string accessToken, string resource, string data = "", string filter = "", string fields = "")
        {
            var request = Constants.Endpoint + resource + "?access_token=" + accessToken;

            if (!string.IsNullOrEmpty(data))
                request += "&" + data;
            
            if (!string.IsNullOrEmpty(filter))
                request += "&" + filter;

            if (!string.IsNullOrEmpty(fields))
                request += "&fields=" + fields;

            return request;
        }

        public static HttpResponseMessage PostRequest(string accessToken, string resource, string data = "")
        {
            var request = GetUrl(accessToken, resource, data);

            Console.WriteLine("post request: " + request);
            using (var client = new HttpClient())
            {
                var response = client.PostAsync(request, null).Result;
                return response;
            }
        }

        public static HttpResponseMessage GetRequest(string accessToken, string resource, string filter = "", string fields = "")
        {
            var request = GetUrl(accessToken, resource, string.Empty, filter, fields);

            Console.WriteLine("get request: " + request);
            using (var client = new HttpClient())
            {
                var response = client.GetAsync(request).Result;

                return response;
            }
        }

        public static HttpResponseMessage GetRequest(string request)
        {
            Console.WriteLine("get request: " + request);
            using (var client = new HttpClient())
            {
                var response = client.GetAsync(request).Result;

                return response;
            }
        }
    }
}
