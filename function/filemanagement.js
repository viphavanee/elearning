const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { format } = require("util")
const { Storage } = require("@google-cloud/storage")
const gcs = new Storage({ keyFilename: process.env.GOOGLE_CLOUD_KEY })
const bucket = gcs.bucket(process.env.GCS_BUCKET_NAME)
const memberProfileUpload = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `memberProfile${uuidv4()}`,
                pathfile: data.memberId,
                image: data.image
            }
            dataUpload = await uploadFileMember(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const uploadFileMember = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let originalname = data.originalname
            let pathfile = data.pathfile
            var blob = bucket.file(`${process.env.GCS_FOLDER_MEMBER}/${pathfile}/${originalname}.png`)
            const blobStream = blob.createWriteStream({
                resumable: false,
            })
            blobStream.on("error", (err) => {
                console.log({ message: err.message })
                resolve({
                    "status_code": "301",
                    "status_phrase": "FAIL",
                    "message": err.message
                })
            })
            blobStream.on("finish", async (data) => {
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                )
                try {
                    await blob.makePublic()
                } catch (error) {
                    resolve({
                        message: `Uploaded the file successfully: ${originalname}, but public access is denied!`,
                        url: publicUrl,
                    })
                }
                resolve({
                    message: "Uploaded the file successfully: " + originalname,
                    url: publicUrl,
                })
            })
            blobStream.end(Buffer.from(data.image, 'base64'))
        } catch (error) {
            console.log(error)
            resolve({
                "status_code": "301",
                "status_phrase": "FAIL",
                "message": `Correct Data Error!!`,
                "sqlmessage": error.sqlMessage
            })
        }
    })

}
const uploadFileArtist = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let originalname = data.originalname
            let pathfile = data.pathfile
            var blob = bucket.file(`${process.env.GCS_FOLDER_ARTIST}/${pathfile}/${originalname}.png`)
            const blobStream = blob.createWriteStream({
                resumable: false,
            })
            blobStream.on("error", (err) => {
                console.log({ message: err.message })
                resolve({
                    "status_code": "301",
                    "status_phrase": "FAIL",
                    "message": err.message
                })
            })
            blobStream.on("finish", async (data) => {
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                )
                try {
                    await blob.makePublic()
                } catch (error) {
                    resolve({
                        message: `Uploaded the file successfully: ${originalname}, but public access is denied!`,
                        url: publicUrl,
                    })
                }
                resolve({
                    message: "Uploaded the file successfully: " + originalname,
                    url: publicUrl,
                })
            })
            blobStream.end(Buffer.from(data.image, 'base64'))
        } catch (error) {
            console.log(error)
            resolve({
                "status_code": "301",
                "status_phrase": "FAIL",
                "message": `Correct Data Error!!`,
                "sqlmessage": error.sqlMessage
            })
        }
    })

}
const deleteMemberProfile = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_MEMBER}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const artistCoverUpload = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `artistCover${uuidv4()}`,
                pathfile: data.artistId,
                image: data.image
            }
            dataUpload = await uploadFileArtist(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const artistImageUpload = async (data, imageData) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `artistImage${uuidv4()}`,
                pathfile: data.artistId,
                image: imageData
            }
            dataUpload = await uploadFileArtist(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const deleteArtistCover = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_ARTIST}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const deleteArtistImage = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_ARTIST}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const uploadFileEntertainment = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let originalname = data.originalname
            let pathfile = data.pathfile
            var blob = bucket.file(`${process.env.GCS_FOLDER_ENTERTAINMENT}/${pathfile}/${originalname}.png`)
            const blobStream = blob.createWriteStream({
                resumable: false,
            })
            blobStream.on("error", (err) => {
                console.log({ message: err.message })
                resolve({
                    "status_code": "301",
                    "status_phrase": "FAIL",
                    "message": err.message
                })
            })
            blobStream.on("finish", async (data) => {
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                )
                try {
                    await blob.makePublic()
                } catch (error) {
                    resolve({
                        message: `Uploaded the file successfully: ${originalname}, but public access is denied!`,
                        url: publicUrl,
                    })
                }
                resolve({
                    message: "Uploaded the file successfully: " + originalname,
                    url: publicUrl,
                })
            })
            blobStream.end(Buffer.from(data.image, 'base64'))
        } catch (error) {
            console.log(error)
            resolve({
                "status_code": "301",
                "status_phrase": "FAIL",
                "message": `Correct Data Error!!`,
                "sqlmessage": error.sqlMessage
            })
        }
    })

}
const entertainmentCoverUpload = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `entertainmentCover${uuidv4()}`,
                pathfile: data.entertainmentId,
                image: data.image
            }
            dataUpload = await uploadFileEntertainment(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const entertainmentImageUpload = async (data, imageData) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `entertainmentImage${uuidv4()}`,
                pathfile: data.entertainmentId,
                image: imageData
            }
            dataUpload = await uploadFileEntertainment(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const deleteEntertainmentCover = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_ENTERTAINMENT}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const deleteEntertainmentImage = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_ENTERTAINMENT}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const uploadFileFoodBeverage = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let originalname = data.originalname
            let pathfile = data.pathfile
            var blob = bucket.file(`${process.env.GCS_FOLDER_FOODBEVERAGE}/${pathfile}/${originalname}.png`)
            const blobStream = blob.createWriteStream({
                resumable: false,
            })
            blobStream.on("error", (err) => {
                console.log({ message: err.message })
                resolve({
                    "status_code": "301",
                    "status_phrase": "FAIL",
                    "message": err.message
                })
            })
            blobStream.on("finish", async (data) => {
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                )
                try {
                    await blob.makePublic()
                } catch (error) {
                    resolve({
                        message: `Uploaded the file successfully: ${originalname}, but public access is denied!`,
                        url: publicUrl,
                    })
                }
                resolve({
                    message: "Uploaded the file successfully: " + originalname,
                    url: publicUrl,
                })
            })
            blobStream.end(Buffer.from(data.image, 'base64'))
        } catch (error) {
            console.log(error)
            resolve({
                "status_code": "301",
                "status_phrase": "FAIL",
                "message": `Correct Data Error!!`,
                "sqlmessage": error.sqlMessage
            })
        }
    })

}
const foodBeverageCoverUpload = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `foodBeverageCover${uuidv4()}`,
                pathfile: data.foodBeverageId,
                image: data.image
            }
            dataUpload = await uploadFileFoodBeverage(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const foodBeverageImageUpload = async (data, imageData) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `foodBeverageImage${uuidv4()}`,
                pathfile: data.foodBeverageId,
                image: imageData
            }
            dataUpload = await uploadFileFoodBeverage(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const deleteFoodBeverageCover = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_FOODBEVERAGE}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const deleteFoodBeverageImage = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_FOODBEVERAGE}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const uploadFileMusicCategory = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let originalname = data.originalname
            let pathfile = data.pathfile
            var blob = bucket.file(`${process.env.GCS_FOLDER_MUSICCATEGORY}/${pathfile}/${originalname}.png`)
            const blobStream = blob.createWriteStream({
                resumable: false,
            })
            blobStream.on("error", (err) => {
                console.log({ message: err.message })
                resolve({
                    "status_code": "301",
                    "status_phrase": "FAIL",
                    "message": err.message
                })
            })
            blobStream.on("finish", async (data) => {
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                )
                try {
                    await blob.makePublic()
                } catch (error) {
                    resolve({
                        message: `Uploaded the file successfully: ${originalname}, but public access is denied!`,
                        url: publicUrl,
                    })
                }
                resolve({
                    message: "Uploaded the file successfully: " + originalname,
                    url: publicUrl,
                })
            })
            blobStream.end(Buffer.from(data.image, 'base64'))
        } catch (error) {
            console.log(error)
            resolve({
                "status_code": "301",
                "status_phrase": "FAIL",
                "message": `Correct Data Error!!`,
                "sqlmessage": error.sqlMessage
            })
        }
    })

}
const musicCategoryCoverUpload = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `musicCategoryCover${uuidv4()}`,
                pathfile: data.musicCategoryId,
                image: data.image
            }
            dataUpload = await uploadFileMusicCategory(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const deleteMusicCategoryCover = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_MUSICCATEGORY}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const uploadFileTechnician = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let originalname = data.originalname
            let pathfile = data.pathfile
            var blob = bucket.file(`${process.env.GCS_FOLDER_TECHNICIAN}/${pathfile}/${originalname}.png`)
            const blobStream = blob.createWriteStream({
                resumable: false,
            })
            blobStream.on("error", (err) => {
                console.log({ message: err.message })
                resolve({
                    "status_code": "301",
                    "status_phrase": "FAIL",
                    "message": err.message
                })
            })
            blobStream.on("finish", async (data) => {
                const publicUrl = format(
                    `https://storage.googleapis.com/${bucket.name}/${blob.name}`
                )
                try {
                    await blob.makePublic()
                } catch (error) {
                    resolve({
                        message: `Uploaded the file successfully: ${originalname}, but public access is denied!`,
                        url: publicUrl,
                    })
                }
                resolve({
                    message: "Uploaded the file successfully: " + originalname,
                    url: publicUrl,
                })
            })
            blobStream.end(Buffer.from(data.image, 'base64'))
        } catch (error) {
            console.log(error)
            resolve({
                "status_code": "301",
                "status_phrase": "FAIL",
                "message": `Correct Data Error!!`,
                "sqlmessage": error.sqlMessage
            })
        }
    })

}
const technicianCoverUpload = async (data) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `technicianCover${uuidv4()}`,
                pathfile: data.technicianId,
                image: data.image
            }
            dataUpload = await uploadFileTechnician(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const technicianImageUpload = async (data, imageData) => {
    return new Promise(async (resolve) => {
        try {
            let dataUpload = {
                originalname: `technicianImage${uuidv4()}`,
                pathfile: data.technicianId,
                image: imageData
            }
            dataUpload = await uploadFileTechnician(dataUpload)
            resolve(dataUpload.url)
        } catch (error) {
            console.log(error)
            resolve(false)
        }
    })
}
const deleteTechnicianCover = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_TECHNICIAN}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
const deleteTechnicianImage = async (originalname) => {
    try {
        bucket.deleteFiles({
            prefix: `${process.env.GCS_FOLDER_TECHNICIAN}/${originalname}`
        }, function (err) {
            if (!err) {
            }
        })
        return (true)
    } catch (error) {
        console.log(error)
        return (false)
    }
}
module.exports = {
    memberProfileUpload, deleteMemberProfile, artistCoverUpload, artistImageUpload, deleteArtistCover, deleteArtistImage,
    entertainmentCoverUpload, entertainmentImageUpload, deleteEntertainmentCover, deleteEntertainmentImage,
    foodBeverageCoverUpload, foodBeverageImageUpload, deleteFoodBeverageCover, deleteFoodBeverageImage,
    musicCategoryCoverUpload, deleteMusicCategoryCover,
    technicianCoverUpload, technicianImageUpload, deleteTechnicianCover, deleteTechnicianImage
}