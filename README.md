# Cloudflare Fullstack Internship Assignment

Implementation of Cloudflare's remote internship take home assignment for Fullstack role.
The deployed version is [available here](https://cf-assignment.arionmiles.workers.dev/).

The complete requirements of the assignment are [available here](https://github.com/cloudflare-internship-2020/internship-application-fullstack).

I'm not a proficient JavaScript developer by any means but the documentation on Cloudflare Workers API and their [Quick Start guide](https://developers.cloudflare.com/workers/quickstart) was more than sufficient to help me complete this assignment.

## Requirements fulfilled
- Request the URLs from the API
    Uses the Fetch API to store response from `https://cfw-takehome.developers.workers.dev/api/variants`.
    This was trivial since I'm familiar with the Fetch API as I've used it previously.
- Request a variant
    Sends Fetch request to the variant URLs received from first request.
- Distribute requests between variants
    Here is where I had to spend a significant amount of timing deciding which approach to use to distribute the requests among the two variants.
    

### Deciding distribution approach
Since the requirement demands the variants served to the user be in a 50/50 split in a A/B testing fashion, there's 2 way this can be accomplished.

1. Use a counter, which is modulo'd with 2 to return either 0 or 1, and thus selecting a URL based on the result. Then incrementing the counter by 1.
2. Use JavaScript's `Math.random()` function to randomly select one of the two URLs. 

The first approach seems easy and can give perfect 50/50 split. But it will eventually lead to integer overflow.

To test whether Math.random() actually gave 50/50 even and odd results, I ran some benchmarks.

The below function uses `Math.random()` to give a number between 0 and `max` (`max` is exclusive)
```javascript
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
```

We then run a loop of 100 or so samples to see how many even and odd results we get.
```
odd = 0; even = 0;

for(i=0; i<100; i++) {
    if (getRandomInt(2) == 0) {
        even += 1;
    }
    else {
        odd += 1;
    }
}
```

Here are the results we get in the V8 engine (Chrome's JavaScript runtime):
|Samples| Even | Odd |
|:----:|:----:|:----:|
|100|55|45|
|500|248|252|
|1000|495|505|
|10000|5049|4951|

The results were close to the above figures in Node `v8.12.0` runtime as well.

**So the results are pretty consistent and there was almost 50% distribution which is what the original requirement demands, hence I went with this approach.**

## Extra Credit tasks:
- Changing copy/URLs

    Uses HTMLRewriter API to modify the response to include links to my blog and GitHub profile, depending on variant received. Also includes changes to the title, heading of the box, the `p#description` element.
    Referred to [documentation of HTMLRewriter](https://developers.cloudflare.com/workers/reference/apis/html-rewriter/) to understand usage.
- Persisting variants

    When a user first visits a website, a variant is chosen and depending on which variant is chosen, a cookie named `cf-assignment` is sent to either `variant1` or `variant2`.
    On the user's consecutive visits, the variant to be fetched is chosen from the set cookie instead of assigning a fresh one.
    Referred to [Cloudflare's tutorial on A/B testing](https://developers.cloudflare.com/workers/templates/pages/ab_testing/) which utilizes setting cookies to determine whether the visitor is from a control or test group.

## Missed Opportunities

I do not possess a registered domain with Cloudflare, so I missed out on deploying to a custom domain. Though, I'm sure it won't be that difficult to accomplish given the ample documentation.