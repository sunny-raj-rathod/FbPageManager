using System;
using System.Net.Http;
using System.Collections.Generic;
using FacebookSEInterview.Models;

namespace FacebookSEInterview.Utilities
{
    public static class PageManagerUtilities
    {
        //Currently in memory, but should be in DB.
        static Dictionary<string, PageManagerSession> Sessions = new Dictionary<string, PageManagerSession>();

        public static void SaveSessionInfo(string userInfo, string sessionInfo)
        {
            var sessionData = new PageManagerSession
            {
                AccessToken = (string)Newtonsoft.Json.Linq.JObject.Parse(sessionInfo)["authResponse"]["accessToken"]
            };
            Sessions[userInfo] = sessionData;
        }

        /**
         * Makes a call to the Facebook APIs to create a page post, and calls the provided callback function
         * when the API call is complete.
         *
         * Note that the callback function expects no arguments.
         *
         * Parameters:
         *   accessToken: The Facebook access token for use in querying the API
         *   postContent: A string representing the page post's content.
         *   isPublished: A boolean stating whether this is supposed to be a published post.
         *
         * This function should not return anything.
         */
        public static void CreatePost(
            string pageId,
            string accessToken,
            string postContent,
            bool isPublished)
        {
            var resource = pageId + "/feed";
            var data = "message=" + postContent;
            if (!isPublished)
                data += "&published=false";
            
            var response = HttpUtility.PostRequest(accessToken, resource, data);

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseContent = response.Content;

                var apiResponse = Newtonsoft.Json.Linq.JObject.Parse(responseContent.ReadAsStringAsync().Result);
            }
        }

        public static void UpdatePost(
            string postId,
            string accessToken,
            string postContent,
            bool isPublished)
        {
            var data = "message=" + postContent;
            if (isPublished)
                data += "&published=true";
            else
                data += "&published=false";
            
            var response = HttpUtility.PostRequest(accessToken, postId, data);

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseContent = response.Content;

                var apiResponse = Newtonsoft.Json.Linq.JObject.Parse(responseContent.ReadAsStringAsync().Result);
            }
        }

        public static PageManagerPagePostsInfo ReadUnpublishedPosts(string pageId, string accessToken, string nextPageUrl = "")
        {
            var result = new PageManagerPagePostsInfo();

            HttpResponseMessage response = null;

            if (!string.IsNullOrEmpty(nextPageUrl))
            {
                response = HttpUtility.GetRequest(nextPageUrl);
            }
            else
            {
                var resource = pageId + "/promotable_posts";
                var filter = "is_published=false";
                response = HttpUtility.GetRequest(accessToken, resource, filter);
            }

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseContent = response.Content;

                var apiResponse = Newtonsoft.Json.Linq.JObject.Parse(responseContent.ReadAsStringAsync().Result);

                foreach (var feed in apiResponse["data"])
                {
                    result.Data.Add(
                        new PageManagerPagePost
                        {
                            Message = (string)feed["message"],
                            DatePosted = (string)feed["created_time"],
                            Id = (string)feed["id"],
                            IsPublished = false
                        }
                    );
                }
                result.NextPageUrl = (apiResponse["paging"]["next"] != null ? (string)apiResponse["paging"]["next"] : null);
            }
            return result;
        }

        /**
         * Makes a call to the Facebook APIs to read all posts and unpublished posts from a page, and calls the provided
         * callback function when the API call is complete.
         *
         * Note that the callback function expects an array of objects in the following format:
         * { message: "a message", datePosted: "2017-08-26 11:36:00", isPublished: false }
         * (The date format doesn't need to match exactly but should include the date and time.)
         *
         * Parameters:
         *   accessToken: The Facebook access token for use in querying the API
         *
         * This function should not return anything.
         */
        public static PageManagerPagePostsInfo ReadPost(string pageId, string accessToken, string nextPageUrl = "")
        {
            var result = new PageManagerPagePostsInfo();

            var url = string.Empty;

            HttpResponseMessage response = null;

            if(!string.IsNullOrEmpty(nextPageUrl))
            {
                response = HttpUtility.GetRequest(nextPageUrl);
            }
            else{
                var resource = pageId + "/posts";
                var fields = "comments,message,created_time,reactions";
                response = HttpUtility.GetRequest(accessToken, resource, string.Empty, fields);
            }

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseContent = response.Content;

                var apiResponse = Newtonsoft.Json.Linq.JObject.Parse(responseContent.ReadAsStringAsync().Result);

                foreach (var feed in apiResponse["data"])
                {
                    result.Data.Add(
                        new PageManagerPagePost
                        {
                            Message = (string)feed["message"],
                            DatePosted = (string)feed["created_time"],
                            Id = (string)feed["id"],
                            NumberOfComments = ((Newtonsoft.Json.Linq.JObject)feed["comments"] != null ? ((Newtonsoft.Json.Linq.JArray)feed["comments"]["data"]).Count : 0),
                            NumberOfReactions = ((Newtonsoft.Json.Linq.JObject)feed["reactions"] != null ? ((Newtonsoft.Json.Linq.JArray)feed["reactions"]["data"]).Count : 0),
                            IsPublished = true
                        }
                    );
                }
                result.NextPageUrl = (apiResponse["paging"]["next"] != null ? (string)apiResponse["paging"]["next"] : null);
            }

            return result;
        }

        public static IList<PageManagerPageInfo> GetPageList(string userInfo)
        {
            var result = new List<PageManagerPageInfo>();

            var resource = userInfo + "/accounts";
            var fields = "id,name,access_token,picture";

            var response = HttpUtility.GetRequest(Sessions[userInfo].AccessToken, resource, string.Empty, fields);

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseContent = response.Content;

                var apiResponse = Newtonsoft.Json.Linq.JObject.Parse(responseContent.ReadAsStringAsync().Result);

                foreach (var page in apiResponse["data"])
                {
                    result.Add(
                        new PageManagerPageInfo
                        {
                            Id = (string)page["id"],
                            Name = (string)page["name"],
                            AccessToken = (string)page["access_token"],
                            PictureUrl = (string)page["picture"]["data"]["url"]
                        }
                    );
                }
            }

            return result;
        }

        public static IList<PageManagerPageInsight> GetPageSummary(string pageId, string accessToken)
        {
            var result = new List<PageManagerPageInsight>();

            var resource = pageId + "/insights";
            var filter = "metric=page_fans,page_views_total,page_total_actions,page_fan_removes_unique,page_fan_adds_unique,page_fan_adds&period=week";

            var response = HttpUtility.GetRequest(accessToken, resource, filter);

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseContent = response.Content;

                var apiResponse = Newtonsoft.Json.Linq.JObject.Parse(responseContent.ReadAsStringAsync().Result);

                foreach (var page in apiResponse["data"])
                {
                    var pageInsight =
                        new PageManagerPageInsight
                        {
                            Id = (string)page["id"],
                            Name = (string)page["name"],
                            Period = (string)page["period"],
                            Title = (string)page["title"],
                            Description = (string)page["description"]
                        };

                    pageInsight.Values = new List<ValueInfo>();

                    foreach (var value in page["values"])
                    {
                        var valueInfo = new ValueInfo
                        {
                            Value = (string)value["value"],
                            EndTime = (string)value["end_time"]
                        };
                        pageInsight.Values.Add(valueInfo);
                    }
                    result.Add(pageInsight);
                }
            }

            return result;
        }
    }
}
