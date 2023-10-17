let otpTimerInterval;

// Function to update and display OTP timer
function updateOTPTimer() {
    const otpTimerElement = document.getElementById('otp-timer');
    let timeInSeconds = 300; // 5 minutes (300 seconds)

    // Function to format time as minutes and seconds
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);    
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Clear the existing timer interval, if any
    clearInterval(otpTimerInterval);

    // Update timer every second
    otpTimerInterval = setInterval(() => {
        if (timeInSeconds > 0) {
            otpTimerElement.textContent = `Time left: ${formatTime(timeInSeconds)}`;
            timeInSeconds--;
        } else {
            otpTimerElement.textContent = 'OTP expired';
            clearInterval(otpTimerInterval);
        }
    }, 1000);
}

// Call the function to start the OTP timer
updateOTPTimer();

function resendOTP() {
    
    // For now, let's assume OTP is resent immediately
    updateOTPTimer();
}