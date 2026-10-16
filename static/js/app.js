(function ($) {

    "use strict";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const $language =
        $("#language");

    const $originalCode =
        $("#originalCode");

    const $cleanedCode =
        $("#cleanedCode");

    const $cleanButton =
        $("#cleanButton");

    const $clearButton =
        $("#clearButton");

    const $copyButton =
        $("#copyButton");

    const $downloadButton =
        $("#downloadButton");

    const $swapButton =
        $("#swapButton");

    const $openFileButton =
        $("#openFileButton");

    const $fileInput =
        $("#fileInput");

    const $preserveBlankLines =
        $("#preserveBlankLines");

    const $originalStats =
        $("#originalStats");

    const $cleanedStats =
        $("#cleanedStats");

    const $originalLanguage =
        $("#originalLanguage");

    const $statusDot =
        $("#statusDot");

    const $statusText =
        $("#statusText");

    const $loadingOverlay =
        $("#loadingOverlay");

    const $loadingTitle =
        $("#loadingTitle");

    const $loadingMessage =
        $("#loadingMessage");

    const $toast =
        $("#appToast");

    const $toastMessage =
        $("#toastMessage");


    /* =====================================================
       STATE
    ====================================================== */

    let isProcessing = false;

    let hasCleanedCurrentCode = false;

    let loadingVisible = false;


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const MAX_FILE_SIZE =
        5 * 1024 * 1024;


    const ALLOWED_EXTENSIONS = [
        ".js",
        ".jsx",
        ".mjs",
        ".cjs",
        ".ts",
        ".tsx",
        ".py",
        ".cs",
        ".java",
        ".dart"
    ];


    const LANGUAGE_NAMES = {

        javascript:
            "JavaScript",

        typescript:
            "TypeScript",

        python:
            "Python",

        csharp:
            "C#",

        java:
            "Java",

        dart:
            "Dart / Flutter"
    };


    const DOWNLOAD_EXTENSIONS = {

        javascript:
            "js",

        typescript:
            "ts",

        python:
            "py",

        csharp:
            "cs",

        java:
            "java",

        dart:
            "dart"
    };


    /* =====================================================
       LOADING OVERLAY
       
       IMPORTANT:
       No Bootstrap Modal is used.
    ====================================================== */

    function showLoading(
        title,
        message
    ) {

        if (loadingVisible) {
            return;
        }


        loadingVisible = true;


        $loadingTitle.text(
            title || "Processing..."
        );


        $loadingMessage.text(
            message || "Please wait."
        );


        $loadingOverlay
            .addClass("is-visible")
            .attr(
                "aria-hidden",
                "false"
            );


        $("body").addClass(
            "loading-active"
        );
    }


    function hideLoading() {

        if (!loadingVisible) {
            return;
        }


        loadingVisible = false;


        $loadingOverlay
            .removeClass("is-visible")
            .attr(
                "aria-hidden",
                "true"
            );


        $("body").removeClass(
            "loading-active"
        );
    }


    /* =====================================================
       TOAST
    ====================================================== */

    let toastInstance = null;


    if (
        $toast.length &&
        window.bootstrap
    ) {

        toastInstance =
            bootstrap.Toast.getOrCreateInstance(
                $toast[0],
                {
                    delay: 2600
                }
            );
    }


    function showToast(message) {

        $toastMessage.text(
            String(
                message || ""
            )
        );


        if (toastInstance) {

            toastInstance.show();

        } else {

            $toast.addClass(
                "show"
            );

            setTimeout(
                function () {
                    $toast.removeClass(
                        "show"
                    );
                },
                2600
            );
        }
    }


    /* =====================================================
       STATS
    ====================================================== */

    function getStats(value) {

        if (!value) {

            return {
                lines: 0,
                characters: 0
            };
        }


        return {

            lines:
                value.split(
                    /\r\n|\r|\n/
                ).length,

            characters:
                value.length
        };
    }


    function updateStats() {

        const original =
            getStats(
                String(
                    $originalCode.val() ||
                    ""
                )
            );


        const cleaned =
            getStats(
                String(
                    $cleanedCode.val() ||
                    ""
                )
            );


        $originalStats.text(
            `${original.lines} lines · ${original.characters} characters`
        );


        $cleanedStats.text(
            `${cleaned.lines} lines · ${cleaned.characters} characters`
        );
    }


    /* =====================================================
       LANGUAGE
    ====================================================== */

    function updateLanguageLabel() {

        const language =
            String(
                $language.val() ||
                ""
            );


        $originalLanguage.text(
            LANGUAGE_NAMES[language] ||
            language ||
            "Unknown"
        );
    }


    /* =====================================================
       CLEAN BUTTON
    ====================================================== */

    function updateCleanButton() {

        if (isProcessing) {
            return;
        }


        const code =
            String(
                $originalCode.val() ||
                ""
            );


        const hasCode =
            code.trim().length > 0;


        if (!hasCode) {

            hasCleanedCurrentCode =
                false;


            $cleanButton
                .prop(
                    "disabled",
                    true
                )
                .removeClass(
                    "btn-success"
                )
                .addClass(
                    "btn-primary"
                )
                .html(
                    '<i class="bi bi-magic me-1"></i> Clean Comments'
                );


            return;
        }


        if (
            hasCleanedCurrentCode
        ) {

            $cleanButton
                .prop(
                    "disabled",
                    false
                )
                .removeClass(
                    "btn-primary"
                )
                .addClass(
                    "btn-success"
                )
                .html(
                    '<i class="bi bi-check2 me-1"></i> Cleaned'
                );


            return;
        }


        $cleanButton
            .prop(
                "disabled",
                false
            )
            .removeClass(
                "btn-success"
            )
            .addClass(
                "btn-primary"
            )
            .html(
                '<i class="bi bi-magic me-1"></i> Clean Comments'
            );
    }


    /* =====================================================
       CLEAN BUTTON PROCESSING STATE
    ====================================================== */

    function setCleaningState(
        processing
    ) {

        isProcessing =
            processing;


        if (processing) {

            $cleanButton
                .prop(
                    "disabled",
                    true
                )
                .removeClass(
                    "btn-success"
                )
                .addClass(
                    "btn-primary"
                )
                .html(
                    `
                    <span
                        class="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true">
                    </span>
                    Cleaning...
                    `
                );

            return;
        }


        updateCleanButton();
    }


    /* =====================================================
       FILE BUTTON STATE
    ====================================================== */

    function setFileState(
        processing
    ) {

        $openFileButton.prop(
            "disabled",
            processing
        );


        $fileInput.prop(
            "disabled",
            processing
        );
    }


    /* =====================================================
       API HEALTH
    ====================================================== */

    function setOffline() {

        $statusDot
            .removeClass(
                "online"
            )
            .addClass(
                "offline"
            );


        $statusText.text(
            "API Offline"
        );
    }


    function checkHealth() {

        $.ajax({

            url:
                "/api/v1/health",

            method:
                "GET",

            dataType:
                "json",

            timeout:
                5000

        })

        .done(
            function (response) {

                if (
                    response &&
                    response.success
                ) {

                    $statusDot
                        .removeClass(
                            "offline"
                        )
                        .addClass(
                            "online"
                        );


                    $statusText.text(
                        "API Online"
                    );

                } else {

                    setOffline();
                }
            }
        )

        .fail(
            function () {

                setOffline();
            }
        );
    }


    /* =====================================================
       FILE VALIDATION
    ====================================================== */

    function getFileExtension(
        filename
    ) {

        const name =
            String(
                filename || ""
            ).trim();


        const index =
            name.lastIndexOf(".");


        if (index <= 0) {
            return "";
        }


        return name
            .slice(index)
            .toLowerCase();
    }


    function validateFile(
        file
    ) {

        if (!file) {

            return {
                valid: false,
                message: "No file selected."
            };
        }


        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            return {
                valid: false,
                message:
                    "File is too large. Maximum size is 5 MB."
            };
        }


        const extension =
            getFileExtension(
                file.name
            );


        if (
            !ALLOWED_EXTENSIONS.includes(
                extension
            )
        ) {

            return {
                valid: false,
                message:
                    "Unsupported file type. Please select a supported source-code file."
            };
        }


        return {
            valid: true,
            extension: extension
        };
    }


    /* =====================================================
       READ LOCAL FILE
    ====================================================== */

    function readLocalFile(
        file
    ) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        const result =
                            event.target
                                ?.result;


                        if (
                            typeof result !==
                            "string"
                        ) {

                            reject(
                                new Error(
                                    "Unable to read file."
                                )
                            );

                            return;
                        }


                        resolve(result);
                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to read the selected file."
                            )
                        );
                    };


                reader.onabort =
                    function () {

                        reject(
                            new Error(
                                "File reading was cancelled."
                            )
                        );
                    };


                reader.readAsText(
                    file,
                    "UTF-8"
                );
            }
        );
    }


    /* =====================================================
       PROCESS FILE
       
       IMPORTANT:
       Loading is shown once.
       It is hidden in .always().
    ====================================================== */

    async function processFile(
        file
    ) {

        if (
            isProcessing ||
            !file
        ) {
            return;
        }


        const validation =
            validateFile(
                file
            );


        if (!validation.valid) {

            showToast(
                validation.message
            );

            return;
        }


        /*
         * Set processing state
         * BEFORE starting any async operation.
         */

        isProcessing =
            true;


        setFileState(
            true
        );


        hasCleanedCurrentCode =
            false;


        $cleanedCode.val("");


        $downloadButton.prop(
            "disabled",
            true
        );


        updateStats();


        /*
         * Show overlay.
         */

        showLoading(
            "Processing file...",
            "Reading and cleaning your source file."
        );


        try {

            /*
             * Read the file locally.
             *
             * This ensures the original editor
             * receives exactly what the user selected.
             */

            const source =
                await readLocalFile(
                    file
                );


            /*
             * Show original source immediately.
             */

            $originalCode.val(
                source
            );


            updateStats();


            /*
             * Send to backend.
             */

            const formData =
                new FormData();


            formData.append(
                "file",
                file,
                file.name
            );


            const response =
                await $.ajax({

                    url:
                        "/api/v1/clean/file",

                    method:
                        "POST",

                    data:
                        formData,

                    processData:
                        false,

                    contentType:
                        false,

                    dataType:
                        "json",

                    timeout:
                        30000
                });


            /*
             * Validate response.
             */

            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.error ||
                    "Unable to process file."
                );
            }


            /*
             * Update language.
             */

            if (
                response.language
            ) {

                $language.val(
                    response.language
                );

                updateLanguageLabel();
            }


            /*
             * Update cleaned code.
             */

            $cleanedCode.val(
                String(
                    response.code ||
                    ""
                )
            );


            hasCleanedCurrentCode =
                true;


            $downloadButton.prop(
                "disabled",
                !$cleanedCode.val()
            );


            updateStats();


            updateCleanButton();


            /*
             * SUCCESS
             */

            if (
                response.changed
            ) {

                showToast(
                    "File cleaned successfully."
                );

            } else {

                showToast(
                    "No comments found."
                );
            }


        } catch (error) {

            console.error(
                "File processing error:",
                error
            );


            hasCleanedCurrentCode =
                false;


            $cleanedCode.val("");


            $downloadButton.prop(
                "disabled",
                true
            );


            updateStats();


            let message =
                "Unable to process file.";


            if (
                error &&
                error.status === 413
            ) {

                message =
                    "File is too large.";

            } else if (
                error &&
                error.status === 400
            ) {

                message =
                    error.responseJSON?.error ||
                    "Invalid file.";

            } else if (
                error &&
                error.statusText ===
                "timeout"
            ) {

                message =
                    "File processing timed out.";

            } else if (
                error instanceof Error &&
                error.message
            ) {

                message =
                    error.message;
            }


            showToast(
                message
            );


        } finally {

            /*
             * THIS ALWAYS RUNS.
             *
             * The loading overlay can no longer
             * remain stuck after a successful
             * or failed request.
             */

            hideLoading();


            isProcessing =
                false;


            setFileState(
                false
            );


            updateCleanButton();

        }
    }


    /* =====================================================
       CLEAN CODE
    ====================================================== */

    async function cleanCode() {

        if (isProcessing) {
            return;
        }


        const code =
            String(
                $originalCode.val() ||
                ""
            );


        if (!code.trim()) {

            showToast(
                "Please enter some code first."
            );


            $originalCode.trigger(
                "focus"
            );


            updateCleanButton();

            return;
        }


        const language =
            String(
                $language.val() ||
                ""
            ).trim();


        if (!language) {

            showToast(
                "Please select a language."
            );


            $language.trigger(
                "focus"
            );

            return;
        }


        const payload = {

            language:
                language,

            code:
                code,

            options: {

                preserve_blank_lines:
                    $preserveBlankLines.is(
                        ":checked"
                    )
            }
        };


        /*
         * Reset previous result.
         */

        $cleanedCode.val("");


        $downloadButton.prop(
            "disabled",
            true
        );


        hasCleanedCurrentCode =
            false;


        updateStats();


        /*
         * Start processing.
         */

        setCleaningState(
            true
        );


        showLoading(
            "Cleaning code...",
            "Removing comments from your source code."
        );


        try {

            const response =
                await $.ajax({

                    url:
                        "/api/v1/clean",

                    method:
                        "POST",

                    contentType:
                        "application/json",

                    dataType:
                        "json",

                    data:
                        JSON.stringify(
                            payload
                        ),

                    timeout:
                        30000
                });


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.error ||
                    "Unable to clean code."
                );
            }


            /*
             * Set cleaned result.
             */

            $cleanedCode.val(
                String(
                    response.code ||
                    ""
                )
            );


            hasCleanedCurrentCode =
                true;


            $downloadButton.prop(
                "disabled",
                !$cleanedCode.val()
            );


            updateStats();


            updateCleanButton();


            if (
                response.changed
            ) {

                showToast(
                    "Comments removed successfully."
                );

            } else {

                showToast(
                    "No comments found."
                );
            }


        } catch (error) {

            console.error(
                "Clean code error:",
                error
            );


            hasCleanedCurrentCode =
                false;


            $cleanedCode.val("");


            $downloadButton.prop(
                "disabled",
                true
            );


            updateStats();


            let message =
                "Unable to clean code.";


            if (
                error &&
                error.status === 413
            ) {

                message =
                    "Code is too large.";

            } else if (
                error &&
                error.status === 400
            ) {

                message =
                    error.responseJSON?.error ||
                    "Invalid request.";

            } else if (
                error &&
                error.statusText ===
                "timeout"
            ) {

                message =
                    "The request timed out.";

            } else if (
                error instanceof Error &&
                error.message
            ) {

                message =
                    error.message;
            }


            showToast(
                message
            );


        } finally {

            /*
             * Always close loading.
             */

            hideLoading();


            setCleaningState(
                false
            );

        }
    }


    /* =====================================================
       OPEN FILE
    ====================================================== */

    $openFileButton.on(
        "click",
        function () {

            if (
                isProcessing
            ) {
                return;
            }


            $fileInput.trigger(
                "click"
            );
        }
    );


    /* =====================================================
       FILE SELECTED
    ====================================================== */

    $fileInput.on(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];


            /*
             * Reset input so selecting
             * the same file again works.
             */

            $(this).val("");


            if (!file) {
                return;
            }


            processFile(
                file
            );
        }
    );


    /* =====================================================
       CLEAN BUTTON
    ====================================================== */

    $cleanButton.on(
        "click",
        function () {

            cleanCode();
        }
    );


    /* =====================================================
       ORIGINAL CODE INPUT
    ====================================================== */

    $originalCode.on(
        "input",
        function () {

            if (isProcessing) {
                return;
            }


            /*
             * User changed source code.
             *
             * Previous cleaned result is now
             * no longer guaranteed to match.
             */

            hasCleanedCurrentCode =
                false;


            $cleanedCode.val("");


            $downloadButton.prop(
                "disabled",
                true
            );


            updateStats();

            updateCleanButton();
        }
    );


    /* =====================================================
       CLEANED CODE MANUAL EDIT
    ====================================================== */

    $cleanedCode.on(
        "input",
        function () {

            const value =
                String(
                    $cleanedCode.val() ||
                    ""
                );


            $downloadButton.prop(
                "disabled",
                !value
            );


            updateStats();
        }
    );


    /* =====================================================
       LANGUAGE CHANGE
    ====================================================== */

    $language.on(
        "change",
        function () {

            updateLanguageLabel();


            if (
                String(
                    $originalCode.val() ||
                    ""
                ).trim()
            ) {

                hasCleanedCurrentCode =
                    false;


                $cleanedCode.val("");


                $downloadButton.prop(
                    "disabled",
                    true
                );


                updateStats();

                updateCleanButton();
            }
        }
    );


    /* =====================================================
       PRESERVE BLANK LINES
       
       Changing this option invalidates
       the previous cleaned result.
    ====================================================== */

    $preserveBlankLines.on(
        "change",
        function () {

            if (
                String(
                    $originalCode.val() ||
                    ""
                ).trim()
            ) {

                hasCleanedCurrentCode =
                    false;


                $cleanedCode.val("");


                $downloadButton.prop(
                    "disabled",
                    true
                );


                updateStats();

                updateCleanButton();
            }
        }
    );


    /* =====================================================
       CLEAR
    ====================================================== */

    $clearButton.on(
        "click",
        function () {

            if (isProcessing) {
                return;
            }


            $originalCode.val("");

            $cleanedCode.val("");


            $downloadButton.prop(
                "disabled",
                true
            );


            hasCleanedCurrentCode =
                false;


            updateStats();

            updateCleanButton();


            $originalCode.trigger(
                "focus"
            );


            showToast(
                "Editor cleared."
            );
        }
    );


    /* =====================================================
       SWAP
    ====================================================== */

    $swapButton.on(
        "click",
        function () {

            if (isProcessing) {
                return;
            }


            const cleaned =
                String(
                    $cleanedCode.val() ||
                    ""
                );


            if (!cleaned) {

                showToast(
                    "There is no cleaned code."
                );

                return;
            }


            $originalCode.val(
                cleaned
            );


            $cleanedCode.val("");


            $downloadButton.prop(
                "disabled",
                true
            );


            hasCleanedCurrentCode =
                false;


            updateStats();

            updateCleanButton();


            $originalCode.trigger(
                "focus"
            );


            showToast(
                "Cleaned code moved to original editor."
            );
        }
    );


    /* =====================================================
       COPY
    ====================================================== */

    $copyButton.on(
        "click",
        async function () {

            const code =
                String(
                    $cleanedCode.val() ||
                    ""
                );


            if (!code) {

                showToast(
                    "There is no cleaned code to copy."
                );

                return;
            }


            try {

                if (
                    navigator.clipboard &&
                    window.isSecureContext
                ) {

                    await navigator.clipboard.writeText(
                        code
                    );

                } else {

                    throw new Error(
                        "Clipboard API unavailable."
                    );
                }


                showToast(
                    "Cleaned code copied."
                );


            } catch (error) {

                console.warn(
                    "Clipboard API failed:",
                    error
                );


                /*
                 * Fallback for local development
                 * and older browsers.
                 */

                const textarea =
                    $cleanedCode[0];


                textarea.focus();

                textarea.select();


                try {

                    document.execCommand(
                        "copy"
                    );


                    showToast(
                        "Cleaned code copied."
                    );

                } catch {

                    showToast(
                        "Unable to copy the code."
                    );
                }


                textarea.setSelectionRange(
                    textarea.value.length,
                    textarea.value.length
                );
            }
        }
    );


    /* =====================================================
       DOWNLOAD
    ====================================================== */

    $downloadButton.on(
        "click",
        function () {

            const code =
                String(
                    $cleanedCode.val() ||
                    ""
                );


            if (!code) {

                showToast(
                    "There is no cleaned code."
                );

                return;
            }


            const language =
                String(
                    $language.val() ||
                    ""
                );


            const extension =
                DOWNLOAD_EXTENSIONS[
                    language
                ] || "txt";


            const blob =
                new Blob(
                    [code],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                `cleaned-code.${extension}`;


            /*
             * Append only temporarily.
             */

            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                100
            );


            showToast(
                "Cleaned code downloaded."
            );
        }
    );


    /* =====================================================
       CTRL + ENTER
    ====================================================== */

    $originalCode.on(
        "keydown",
        function (event) {

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();


                if (
                    !isProcessing &&
                    String(
                        $originalCode.val() ||
                        ""
                    ).trim()
                ) {

                    cleanCode();
                }
            }
        }
    );


    /* =====================================================
       PREVENT ENTER FROM SUBMITTING
       IF A FORM IS ADDED LATER
    ====================================================== */

    $(document).on(
        "submit",
        "form",
        function (event) {

            /*
             * There is currently no form,
             * but this prevents accidental
             * browser form submission if one
             * is added around the controls.
             */

            event.preventDefault();
        }
    );


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    updateLanguageLabel();

    updateStats();

    updateCleanButton();

    checkHealth();


    /*
     * Expose for optional external usage.
     */

    window.cleanCode =
        cleanCode;


    window.processCodeFile =
        processFile;


})(jQuery);