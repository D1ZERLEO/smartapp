theme: /
    state: ГолосовойОтвет
    event!: speak_text
    script:
        var text = $context.request.data.parameters.text || "";
        if (text) {
            $reactions.answer({ "value": text });
        }