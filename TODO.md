- Add a configuration file loader of some sort
    Load the configuration into `AppState`
- Add ReCaptcha checks to the backend API again
    Make the actual ReCaptcha check async to the response. Respond ASAP, decide what to do with their vote later.
- Add tests?