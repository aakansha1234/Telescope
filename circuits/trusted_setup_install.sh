set -e

echo "****INSTALLING PTAU TRUSTED SETUP FILE****"
FILE=./powers_of_tau/powersOfTau28_hez_final_14.ptau
if [ -f "${FILE}" ]; then
    echo "Trusted setup file already installed. Exiting..."
else
    echo "Trusted setup file not found. Installing powersOfTau28_hez_final_14.ptau"
    curl -o "${FILE}" https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
fi